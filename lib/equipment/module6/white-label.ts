/**
 * Moduł 6 — white-label: branding tenanta i jego własna domena.
 *
 * Panel OEM wygląda jak panel OEM tego producenta: nazwa marki, kolory, plik
 * logo i domena. Każdy z tych czterech elementów jest WALIDOWANY, nie
 * przepuszczany: kolor musi mieć postać `#rrggbb`, domena musi być
 * hostname'em bez schematu, bez ścieżki i bez portu.
 *
 * [DECISION: 2026-10-15] `resolveTheme` nigdy nie odrzuca brandingu. Panel
 * pokazuje branding, jaki tenent wpisał; brakujące pola biorą wartość z
 * fallbacku, a nie z domyślnej palety platformy — bo platformowa paleta w
 * cudzym panelu to kradzież marki.
 *
 * [DECISION: 2026-10-15] Kontrast jest MIERZONY, nie egzekwowany. Stosunek
 * kontrastu wylicza funkcja `contrastRatio` wg wzoru WCAG 2.x. Żadna wartość
 * progowa nie jest bramkowana automatycznie, bo mandat nie podaje progu —
 * patrz `CONTRAST_RATIO_ASSUMPTION`.
 */

import { z } from 'zod';

import {
  assertSameTenant,
  assertTenantContext,
  tenantId,
  type TenantCapability,
  type TenantContext,
  type TenantId,
} from './tenant';

/** Kolor w formacie `#rrggbb`. Walidowany wzorem, nie ufa długości napisu. */
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** Nazwa hosta: etykiety alfanumeryczne, brak schematu, ścieżki, portu, spacji. */
export const HOSTNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export const HOSTNAME_MAX_LENGTH = 253;

export class BrandingValidationError extends Error {
  readonly field: string;

  constructor(field: string, reason: string) {
    super(`Brandings.tenanta niepoprawny w polu ${field}: ${reason}`);
    this.name = 'BrandingValidationError';
    this.field = field;
  }
}

export class ThemeIncompleteError extends Error {
  readonly missing: readonly string[];

  constructor(missing: readonly string[]) {
    super(`Motyw nie jest kompletny, brakuje pól: ${missing.join(', ')}`);
    this.name = 'ThemeIncompleteError';
    this.missing = [...missing];
  }
}

const hexColorSchema = z
  .string()
  .trim()
  .min(1, 'kolor nie może być pusty')
  .refine((value) => HEX_COLOR_PATTERN.test(value), 'kolor musi mieć postać #rrggbb');

const brandNameSchema = z.string().trim().min(1, 'nazwa marki nie może być pusta').max(120);

/**
 * Referencja zasobu logo. Świadomie BEZ schematu URL — zdalny adres w
 * brandingu tenanta to cudzy host renderujący treść w panelu.
 */
const assetRefSchema = z
  .string()
  .trim()
  .min(1, 'referencja zasobu nie może być pusta')
  .max(512)
  .refine(
    (value) => /^[A-Za-z0-9][A-Za-z0-9/_.-]*$/.test(value),
    'referencja zasobu musi być ścieżką albo kluczem, bez schematu URL',
  );

const hostnameSchema = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .refine((value) => value.length > 0, 'domena nie może być pusta')
  .refine(
    (value) => value.length <= HOSTNAME_MAX_LENGTH,
    `domena przekracza ${String(HOSTNAME_MAX_LENGTH)} znaków`,
  )
  .refine(
    (value) => HOSTNAME_PATTERN.test(value),
    'domena musi być hostname, bez schematu, bez ścieżki i bez portu',
  );

/**
 * Branding tenanta. `.strict()` — nieznany klucz jest BŁĘDEM, nie cicho
 * pomijanym polem. Częściowy branding jest dozwolony (pusty obiekt też),
 * bo panel musi działać w trakcie konfiguracji.
 */
export const brandingConfigSchema = z
  .object({
    brandName: brandNameSchema.optional(),
    primaryColor: hexColorSchema.optional(),
    secondaryColor: hexColorSchema.optional(),
    logoAssetRef: assetRefSchema.optional(),
    customDomain: hostnameSchema.optional(),
  })
  .strict();

export type BrandingConfig = z.infer<typeof brandingConfigSchema>;

const themeFallbackSchema = z
  .object({
    brandName: brandNameSchema,
    primaryColor: hexColorSchema,
    secondaryColor: hexColorSchema,
    logoAssetRef: assetRefSchema.nullish(),
    customDomain: hostnameSchema.nullish(),
  })
  .strict();

/** Wartości zapasowe — kompletne Z DEFINICJI, bo bez nich nie ma motywu. */
export type ThemeFallbackTokens = {
  readonly brandName: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly logoAssetRef: string | null;
  readonly customDomain: string | null;
};

/** Motyw przypięty do tenanta. Bez `tenantId` nie jest motywem. */
export type TenantThemeFallback = ThemeFallbackTokens & {
  readonly tenantId: TenantId;
};

/** Pole motywu + skąd wzięte. Ślad pochodzenia, nie heurystyka. */
export type ThemeFieldOrigin = 'branding' | 'fallback';

export type ThemeFieldName = keyof ThemeFallbackTokens;

/**
 * Zmienne CSS w STAŁEJ kolejności. Kolejność obiektu jest częścią kontraktu
 * SSR: inna kolejność = inne hydratowanie = inny hash w cache.
 */
export const TENANT_THEME_CSS_VARS = [
  '--oem-brand-name',
  '--oem-color-primary',
  '--oem-color-secondary',
  '--oem-logo-asset',
  '--oem-custom-domain',
] as const;

export type TenantTheme = ThemeFallbackTokens & {
  readonly tenantId: TenantId;
  readonly cssVars: Readonly<Record<(typeof TENANT_THEME_CSS_VARS)[number], string>>;
  readonly origins: Readonly<Record<ThemeFieldName, ThemeFieldOrigin>>;
};

/**
 * [ASSUMPTION — NIE ŹRÓDŁO MANDATU] `CONTRAST_RATIO_ASSUMPTION` to próg
 * AA WCAG dla tekstu normalnego. Moduł go NIE egzekwuje — służy wyłącznie
 * jako wartość jawna przekazywana przez wołającego do `assessContrast`.
 * Zastąpienie jej własnym progiem nie wymaga zmiany tego pliku.
 */
export const CONTRAST_RATIO_ASSUMPTION = 4.5;

/** [DECISION: 2026-10-15] Kontrast jest informacją, nie bramką. */
export type ContrastAssessment = {
  readonly primaryColor: string;
  readonly surfaceColor: string;
  readonly ratio: number;
  readonly minRatio: number;
  readonly meetsAssumption: boolean;
};

function parseChannel(pair: string): number {
  return Number.parseInt(pair, 16) / 255;
}

/** Wzór WCAG 2.x — luminancja względna. Wzór jest jawny, próg nie. */
export function relativeLuminance(hexColor: string): number {
  if (!HEX_COLOR_PATTERN.test(hexColor)) {
    throw new BrandingValidationError('kolor', 'kolor musi mieć postać #rrggbb');
  }
  const channels = [
    parseChannel(hexColor.slice(1, 3)),
    parseChannel(hexColor.slice(3, 5)),
    parseChannel(hexColor.slice(5, 7)),
  ].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Stosunek kontrastu w zakresie 1–21. Bez zaokrągleń do czegokolwiek. */
export function contrastRatio(colorA: string, colorB: string): number {
  const a = relativeLuminance(colorA);
  const b = relativeLuminance(colorB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Pomiar kontrastu. `surfaceColor` i `minRatio` są WYMAGANYMI WEJŚCIAMI —
 * funkcja nie zna koloru tła platformy ani progu akceptacji, więc nie
 * zmyśla żadnego z nich.
 */
export function assessContrast(
  branding: unknown,
  surfaceColor: string,
  minRatio: number,
): ContrastAssessment {
  const parsed = parseBranding(branding);
  if (!HEX_COLOR_PATTERN.test(surfaceColor)) {
    throw new BrandingValidationError('kolor tła', 'kolor musi mieć postać #rrggbb');
  }
  if (!Number.isFinite(minRatio) || minRatio <= 0) {
    throw new RangeError(
      `minRatio musi być dodatnią liczbą, otrzymano: ${String(minRatio)}`,
    );
  }
  const primary = parsed.primaryColor;
  if (primary === undefined) {
    throw new BrandingValidationError(
      'primaryColor',
      'kontrast wymaga koloru głównego w brandingu tenanta',
    );
  }
  const ratio = contrastRatio(primary, surfaceColor);
  return {
    primaryColor: primary,
    surfaceColor,
    ratio,
    minRatio,
    meetsAssumption: ratio >= minRatio,
  };
}

function parseBranding(branding: unknown): BrandingConfig {
  const result = brandingConfigSchema.safeParse(branding);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path.map(String).join('.') ?? 'branding';
    throw new BrandingValidationError(field, issue?.message ?? 'niepoprawna struktura');
  }
  return result.data;
}

/**
 * Budowa wartości zapasowych. Wymaga kontekstu tenanta, bo motyw bez
 * właściciela nie jest motywem — jest konfiguracją, którą da się podstawić.
 */
export function defineThemeFallback(
  input: unknown,
  ctx: TenantContext,
): TenantThemeFallback {
  const active = assertTenantContext(ctx, 'defineThemeFallback');
  const result = themeFallbackSchema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path.map(String).join('.') ?? 'fallback';
    throw new BrandingValidationError(field, issue?.message ?? 'niepoprawna struktura');
  }
  const value = result.data;
  const tokens: ThemeFallbackTokens = {
    brandName: value.brandName,
    primaryColor: value.primaryColor,
    secondaryColor: value.secondaryColor,
    logoAssetRef: value.logoAssetRef ?? null,
    customDomain: value.customDomain ?? null,
  };
  assertCompleteTokens(tokens);
  return Object.freeze({ ...tokens, tenantId: active.tenantId });
}

/**
 * Pola, bez których motyw nie istnieje. Logo i domena są warunkowe —
 * tenant ich nie ma i to jest prawidłowe, a nie niekompletne.
 */
export const REQUIRED_THEME_FIELDS = [
  'brandName',
  'primaryColor',
  'secondaryColor',
] as const;

function assertCompleteTokens(tokens: ThemeFallbackTokens): void {
  const missing = REQUIRED_THEME_FIELDS.filter((key) => {
    const value = tokens[key];
    return value === null || value === undefined || value.length === 0;
  });
  if (missing.length > 0) throw new ThemeIncompleteError(missing);
}

/**
 * Rozwiązuje motyw. Deterministyczny: brak daty, brak losowości, brak I/O —
 * ten sam branding i ten sam fallback zawsze dają ten sam obiekt.
 *
 * Kolejność: kontekst → fallback → branding. Fallback walidowany jest
 * zawsze, nawet gdy branding jest kompletny, bo niespójny fallback to
 * cicha zmiana motywu przy zmianie jednego pola brandingu.
 */
export function resolveTheme(
  branding: unknown,
  fallback: TenantThemeFallback,
  ctx: TenantContext,
): TenantTheme {
  const active = assertTenantContext(ctx, 'resolveTheme');
  const parsed = parseBranding(branding);
  const base = readFallback(fallback, active.tenantId);

  const origins: Record<ThemeFieldName, ThemeFieldOrigin> = {
    brandName: 'fallback',
    primaryColor: 'fallback',
    secondaryColor: 'fallback',
    logoAssetRef: 'fallback',
    customDomain: 'fallback',
  };
  const tokens: ThemeFallbackTokens = {
    brandName: parsed.brandName ?? base.brandName,
    primaryColor: parsed.primaryColor ?? base.primaryColor,
    secondaryColor: parsed.secondaryColor ?? base.secondaryColor,
    logoAssetRef: parsed.logoAssetRef ?? base.logoAssetRef,
    customDomain: parsed.customDomain ?? base.customDomain,
  };

  if (parsed.brandName !== undefined) origins.brandName = 'branding';
  if (parsed.primaryColor !== undefined) origins.primaryColor = 'branding';
  if (parsed.secondaryColor !== undefined) origins.secondaryColor = 'branding';
  if (parsed.logoAssetRef !== undefined) origins.logoAssetRef = 'branding';
  if (parsed.customDomain !== undefined) origins.customDomain = 'branding';

  assertCompleteTokens(tokens);

  const cssVars = {
    '--oem-brand-name': tokens.brandName,
    '--oem-color-primary': tokens.primaryColor,
    '--oem-color-secondary': tokens.secondaryColor,
    '--oem-logo-asset': tokens.logoAssetRef ?? 'none',
    '--oem-custom-domain': tokens.customDomain ?? 'none',
  } as TenantTheme['cssVars'];

  return Object.freeze({
    ...tokens,
    tenantId: active.tenantId,
    cssVars: Object.freeze(cssVars),
    origins: Object.freeze(origins),
  });
}

function readFallback(fallback: TenantThemeFallback, activeTenantId: TenantId): ThemeFallbackTokens {
  if (fallback === null || typeof fallback !== 'object') {
    throw new ThemeIncompleteError(['fallback']);
  }
  assertSameTenant(activeTenantId, fallback.tenantId, 'motyw zapasowy');
  const tokens: ThemeFallbackTokens = {
    brandName: fallback.brandName,
    primaryColor: fallback.primaryColor,
    secondaryColor: fallback.secondaryColor,
    logoAssetRef: fallback.logoAssetRef ?? null,
    customDomain: fallback.customDomain ?? null,
  };
  const result = themeFallbackSchema.safeParse(tokens);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path.map(String).join('.') ?? 'fallback';
    throw new BrandingValidationError(field, issue?.message ?? 'niepoprawna wartość zapasowa');
  }
  return tokens;
}

/** Kompletność motywu — używane w testach i w bramce renderowania. */
export function isCompleteTheme(theme: unknown): theme is TenantTheme {
  if (theme === null || typeof theme !== 'object') return false;
  const candidate = theme as Partial<TenantTheme>;
  if (typeof candidate.brandName !== 'string' || candidate.brandName.length === 0) return false;
  if (!HEX_COLOR_PATTERN.test(candidate.primaryColor ?? '')) return false;
  if (!HEX_COLOR_PATTERN.test(candidate.secondaryColor ?? '')) return false;
  const vars = candidate.cssVars;
  if (vars === null || typeof vars !== 'object') return false;
  return TENANT_THEME_CSS_VARS.every((name) => typeof vars[name] === 'string');
}

/** Wymagane uprawnienie do zapisu brandingu — używane przez warstwę akcji. */
export const BRANDING_WRITE_CAPABILITY: TenantCapability = 'branding:write';

export function brandingOwnerId(ctx: TenantContext): TenantId {
  return tenantId(assertTenantContext(ctx).tenantId);
}