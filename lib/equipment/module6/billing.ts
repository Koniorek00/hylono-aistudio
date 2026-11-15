/**
 * Moduł 6 — rozliczenie OEM: abonament SaaS + prowizja od zamówień.
 *
 * [DECISION: 2026-10-15] Mandat opisuje MODEL rozliczenia, nie CENNIK.
 * Nie ma w nim stawki abonamentu, stawki prowizji ani ceny zlecenia. Dlatego
 * `computePeriodBilling` NIE MA DOMYŚLNEJ STAWKI: `commissionBasisPoints`
 * jest wymaganym wejściem, a jego brak rzuca `MissingRateError` zamiast
 * policzyć prowizję zerową. Cicha wartość domyślna w rozliczeniu to sposób na
 * wygenerowanie zera, którego nikt nie zamówił.
 *
 * [DECISION: 2026-10-15] Grosze są całkowite ZAWSZE, także w mnożeniu
 * procentowym. Prowizja dająca pół grosza rzuca — nie zaokrągla. Zaokrąglenie
 * w górę jest pomyłką na korzyść kontrahenta, w dół — na korzyść platformy;
 * obie strony są nie do obronienia przed audytem.
 *
 * [DECISION: 2026-10-15] Tabela `equipment_tenant_billing` nie ma kolumny ze
 * stawką. Raport odtworzony z rekordu dlatego NIE wypisuje procentu
 * prowizji — wypisanie stawki, której nie ma w rekordzie, byłoby jej
 * zmyśleniem.
 *
 * Waluty obce NIGDY nie są kwotą transakcyjną. `formatBillingReport` przyjmuje
 * je wyłącznie jako `IndicativeAmount` z `indicativeAmount()`.
 */

import {
  billingTotal,
  formatPln,
  indicativeAmount,
  isPlnGrosze,
  percentOfPln,
  plnFromGrosze,
  type BillingBreakdown,
  type IndicativeAmount,
  type PlnGrosze,
  type SourceCurrency,
} from '../shared/money-pln';

import {
  assertSameTenant,
  assertTenantContext,
  type TenantContext,
  type TenantId,
} from './tenant';

/** Stawka prowizji w punktach procentowych. 10000 = 100%. */
export type CommissionBasisPoints = number & { readonly __brand: 'CommissionBasisPoints' };

export const COMMISSION_BASIS_POINTS_MAX = 10_000;

/** Brak wymaganej stawki. Osobny typ, żeby caller odróżnił to od błędu kwoty. */
export class MissingRateError extends Error {
  readonly field: string;

  constructor(field: string) {
    super(
      `${field} jest wymaganym wejściem i nie ma wartości domyślnej — ` +
        'mandat nie podaje cennika panelu OEM, więc stawkę podaje caller.',
    );
    this.name = 'MissingRateError';
    this.field = field;
  }
}

/** Prowizja nie mieści się w całkowitych groszach. Pochodzi z `RangeError`. */
export class CommissionPrecisionError extends RangeError {
  readonly baseGrosze: number;
  readonly basisPoints: number;

  constructor(baseGrosze: number, basisPoints: number, product: number) {
    super(
      `Prowizja nie jest całkowitą liczbą groszy: ${String(baseGrosze)} × ` +
        `${String(basisPoints)}/10000 = ${String(product)} groszy. ` +
        'Zaokrąglenie zostało odrzucone — kwota musi być rozwiązywalna co do grosza.',
    );
    this.name = 'CommissionPrecisionError';
    this.baseGrosze = baseGrosze;
    this.basisPoints = basisPoints;
  }
}

/** Kwota obca podana jako transakcyjna. Odrzucana zawsze. */
export class UnlabelledSourceFigureError extends Error {
  constructor(reason: string) {
    super(
      `Kwota w walucie obcej musi pochodzić z indicativeAmount(): ${reason}. ` +
        'Kanon: kwota obca jest oznaczeniem danych źródłowych, nie ceną.',
    );
    this.name = 'UnlabelledSourceFigureError';
  }
}

const SOURCE_CURRENCIES: ReadonlySet<string> = new Set<SourceCurrency>([
  'USD',
  'EUR',
  'GBP',
  'CHF',
]);

/** Ujednolicenie stawki. Zero jest dozwolone — brak prowizji to decyzja. */
export function commissionBasisPoints(value: unknown): CommissionBasisPoints {
  if (value === undefined || value === null) {
    throw new MissingRateError('commissionBasisPoints');
  }
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new RangeError(
      'commissionBasisPoints musi być całkowitą liczbą punktów procentowych, ' +
        `otrzymano: ${String(value)}`,
    );
  }
  if (value < 0 || value > COMMISSION_BASIS_POINTS_MAX) {
    throw new RangeError(
      'commissionBasisPoints musi mieścić się w przedziale 0–' +
        `${String(COMMISSION_BASIS_POINTS_MAX)}, otrzymano: ${String(value)}`,
    );
  }
  return value as CommissionBasisPoints;
}

/** Zlecenie w ujęciu rozliczeniowym. Dopasowane do `equipment_service_orders`. */
export type BillableOrder = {
  readonly id: string;
  readonly oemTenantId: string;
  /** Grosze PLN. `null` = zlecenie jeszcze niewycenione — nie wnosi do sumy. */
  readonly orderValuePlnGrosze: PlnGrosze | null;
  /** ISO 8601. `null` = zlecenie jeszcze nie zlecone, poza okresem rozliczenia. */
  readonly commissionedAt: string | null;
};

export type PeriodBillingArgs = {
  readonly ctx: TenantContext;
  readonly subscriptionPln: PlnGrosze;
  readonly orders: readonly BillableOrder[];
  readonly commissionBasisPoints: CommissionBasisPoints;
  readonly periodStart: string;
  readonly periodEnd: string;
};

/**
 * Widok rozliczenia. Trzy pola są `null`, gdy pochodzą z rekordu w bazie —
 * tabela ich nie przechowuje, a zmyślenie wartości jest gorsze od jej braku.
 */
export type BillingReportView = {
  readonly tenantId: TenantId;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly subscriptionPln: PlnGrosze;
  readonly commissionPln: PlnGrosze;
  readonly orderCount: number;
  readonly totalPln: PlnGrosze;
  readonly commissionBasisPoints: CommissionBasisPoints | null;
  readonly ordersPlnGrosze: PlnGrosze | null;
  readonly unpricedOrderCount: number;
  readonly notCommissionedOrderCount: number;
};

/** Wynik `computePeriodBilling` — widok z kompletem pól wyliczonych. */
export type TenantBillingBreakdown = BillingReportView & {
  readonly commissionBasisPoints: CommissionBasisPoints;
  readonly ordersPlnGrosze: PlnGrosze;
};

function parseInstant(value: unknown, field: string): Date {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RangeError(
      `${field} musi być znacznikiem czasu ISO 8601, otrzymano: ${String(value)}`,
    );
  }
  const instant = Date.parse(value);
  if (Number.isNaN(instant)) {
    throw new RangeError(`${field} nie jest znacznikiem czasu ISO 8601: ${value}`);
  }
  return new Date(instant);
}

/**
 * Rozliczenie okresu dla JEDNEGO tenanta.
 *
 * Kolejność bramek ma znaczenie dowodowe:
 * 1. kontekst tenanta — bez niego nie ma zakresu,
 * 2. wymagana stawka — zanim policzymy cokolwiek,
 * 3. okres — pusty lub odwrócony okres to błąd danych, nie zero,
 * 4. właściciel każdego zlecenia — obce zlecenie jest BŁĘDEM, bo zlecenie
 *    innego tenanta to nie dane do odfiltrowania, tylko błąd zapytania,
 *    który zostawia ślad poza rozliczeniem,
 * 5. grosze — suma i mnożenie sprawdzane co do liczby całkowitej.
 */
export function computePeriodBilling(args: PeriodBillingArgs): TenantBillingBreakdown {
  if (args === null || typeof args !== 'object') {
    throw new TypeError('computePeriodBilling wymaga obiektu argumentów');
  }
  const active = assertTenantContext(args.ctx, 'computePeriodBilling.ctx');

  const basisPoints = commissionBasisPoints(args.commissionBasisPoints);

  if (!isPlnGrosze(args.subscriptionPln)) {
    throw new RangeError(
      `subscriptionPln musi być całkowitą liczbą groszy, otrzymano: ${String(args.subscriptionPln)}`,
    );
  }
  const subscription = plnFromGrosze(args.subscriptionPln, 'subscriptionPln');

  const periodStart = parseInstant(args.periodStart, 'periodStart');
  const periodEnd = parseInstant(args.periodEnd, 'periodEnd');
  if (periodEnd.getTime() <= periodStart.getTime()) {
    throw new RangeError(
      `Okres rozliczenia musi być niepusty: periodStart=${String(args.periodStart)}, ` +
        `periodEnd=${String(args.periodEnd)}`,
    );
  }

  const orders = args.orders;
  if (!Array.isArray(orders)) {
    throw new TypeError('orders musi być tablicą zleceń');
  }

  let ordersPlnGrosze: PlnGrosze = plnFromGrosze(0, 'ordersPlnGrosze');
  let orderCount = 0;
  let unpricedOrderCount = 0;
  let notCommissionedOrderCount = 0;

  for (const order of orders) {
    if (order === null || typeof order !== 'object') {
      throw new TypeError('każde zlecenie musi być obiektem BillableOrder');
    }
    assertSameTenant(active.tenantId, order.oemTenantId, `zlecenie ${String(order.id)}`);

    if (order.commissionedAt === null) {
      notCommissionedOrderCount += 1;
      continue;
    }
    const at = parseInstant(
      order.commissionedAt,
      `zlecenie ${String(order.id)}: commissionedAt`,
    ).getTime();
    if (at < periodStart.getTime() || at >= periodEnd.getTime()) continue;

    orderCount += 1;
    const value = order.orderValuePlnGrosze;
    if (value === null || value === undefined) {
      unpricedOrderCount += 1;
      continue;
    }
    if (!isPlnGrosze(value)) {
      throw new RangeError(
        `zlecenie ${String(order.id)}: wartość musi być całkowitą liczbą groszy, ` +
          `otrzymano: ${String(value)}`,
      );
    }
    ordersPlnGrosze = plnFromGrosze(
      ordersPlnGrosze + value,
      `suma zleceń (zlecenie ${String(order.id)})`,
    );
  }

  let commissionPln: PlnGrosze;
  try {
    commissionPln = percentOfPln(ordersPlnGrosze, basisPoints);
  } catch {
    throw new CommissionPrecisionError(
      ordersPlnGrosze,
      basisPoints,
      ordersPlnGrosze * (basisPoints / 10_000),
    );
  }

  return Object.freeze({
    tenantId: active.tenantId,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    subscriptionPln: subscription,
    commissionPln,
    orderCount,
    totalPln: billingTotal(subscription, commissionPln),
    commissionBasisPoints: basisPoints,
    ordersPlnGrosze,
    unpricedOrderCount,
    notCommissionedOrderCount,
  });
}

/** Wiersz tabeli `equipment_tenant_billing` w formie strukturalnej. */
export type TenantBillingRecord = {
  readonly oemTenantId: string;
  readonly periodStart: string | Date;
  readonly periodEnd: string | Date;
  readonly subscriptionPlnGrosze: number;
  readonly commissionPlnGrosze: number;
  readonly orderCount: number;
};

function toIso(value: string | Date, field: string): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new RangeError(`${field}: niepoprawna data`);
    return value.toISOString();
  }
  return parseInstant(value, field).toISOString();
}

/**
 * Odczyt zapisanego rozliczenia. Izolacja jest egzekwowana przy ODCZYCIE,
 * a nie tylko przy zapisie: cudzy rekord nie staje się fakturą tylko
 * dlatego, że dotarł do funkcji.
 *
 * Rekord nie ma kolumny ze stawką ani z sumą wartości zleceń, więc te pola
 * są `null`, a raport ich nie wypisuje.
 */
export function billingReportViewFromRecord(
  record: TenantBillingRecord,
  ctx: TenantContext,
): BillingReportView {
  const active = assertTenantContext(ctx, 'billingReportViewFromRecord.ctx');
  if (record === null || typeof record !== 'object') {
    throw new TypeError('billingReportViewFromRecord wymaga rekordu rozliczenia');
  }
  assertSameTenant(active.tenantId, record.oemTenantId, 'rekord rozliczenia');
  if (!isPlnGrosze(record.subscriptionPlnGrosze)) {
    throw new RangeError('subscriptionPlnGrosze musi być całkowitą liczbą groszy');
  }
  if (!isPlnGrosze(record.commissionPlnGrosze)) {
    throw new RangeError('commissionPlnGrosze musi być całkowitą liczbą groszy');
  }
  if (!Number.isSafeInteger(record.orderCount) || record.orderCount < 0) {
    throw new RangeError(
      `orderCount musi być nieujemną całkowitością, otrzymano: ${String(record.orderCount)}`,
    );
  }
  const subscription = plnFromGrosze(record.subscriptionPlnGrosze, 'subscriptionPlnGrosze');
  const commission = plnFromGrosze(record.commissionPlnGrosze, 'commissionPlnGrosze');

  return Object.freeze({
    tenantId: active.tenantId,
    periodStart: toIso(record.periodStart, 'periodStart'),
    periodEnd: toIso(record.periodEnd, 'periodEnd'),
    subscriptionPln: subscription,
    commissionPln: commission,
    orderCount: record.orderCount,
    totalPln: billingTotal(subscription, commission),
    commissionBasisPoints: null,
    ordersPlnGrosze: null,
    unpricedOrderCount: 0,
    notCommissionedOrderCount: 0,
  });
}

const SOURCE_NUMBER_FORMAT = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Kwota obca jako wartość źródłowa. Nigdy jako cena. */
export function formatIndicativeSourceFigure(figure: IndicativeAmount): string {
  if (
    figure === null ||
    typeof figure !== 'object' ||
    figure.kind !== 'indicative' ||
    !SOURCE_CURRENCIES.has(String(figure.sourceCurrency)) ||
    !Number.isFinite(figure.sourceAmount)
  ) {
    throw new UnlabelledSourceFigureError(
      `otrzymano ${JSON.stringify(figure ?? null)} zamiast wyniku indicativeAmount()`,
    );
  }
  // Ponowne opakowanie waliduje kwotę i uniecznia walutę spoza typu.
  const labelled = indicativeAmount(figure.sourceAmount, figure.sourceCurrency, figure.note);
  return `≈ ${SOURCE_NUMBER_FORMAT.format(labelled.sourceAmount)} ${labelled.sourceCurrency} — ${labelled.note}`;
}

/** Walidacja widoku przed formatowaniem — kwota, która nie jest groszami, nie wychodzi. */
export function assertReportableBreakdown(value: unknown): asserts value is BillingReportView {
  if (value === null || typeof value !== 'object') {
    throw new TypeError('formatBillingReport wymaga rozliczenia');
  }
  const candidate = value as Partial<BillingReportView>;
  for (const field of ['subscriptionPln', 'commissionPln', 'totalPln'] as const) {
    if (!isPlnGrosze(candidate[field])) {
      throw new RangeError(
        `Pole ${field} musi być całkowitą liczbą groszy, otrzymano: ${String(candidate[field])}`,
      );
    }
  }
  if (candidate.ordersPlnGrosze !== null && !isPlnGrosze(candidate.ordersPlnGrosze)) {
    throw new RangeError('ordersPlnGrosze musi być całkowitą liczbą groszy albo null');
  }
  if (!Number.isSafeInteger(candidate.orderCount)) {
    throw new RangeError(
      `orderCount musi być całkowitością, otrzymano: ${String(candidate.orderCount)}`,
    );
  }
  if (
    typeof candidate.periodStart !== 'string' ||
    typeof candidate.periodEnd !== 'string'
  ) {
    throw new RangeError('Okres rozliczenia musi być zapisany jako ISO 8601');
  }
}

/**
 * Raport rozliczeniowy — tekst polski, każda kwota przez `formatPln`.
 * Procent prowizji pojawia się tylko wtedy, gdy stawka jest znana; kwoty obce
 * idą wyłącznie przez `formatIndicativeSourceFigure`, z etykietą źródłową.
 */
export function formatBillingReport(
  breakdown: unknown,
  ctx: TenantContext,
  sourceFigures: readonly IndicativeAmount[] = [],
): string {
  const active = assertTenantContext(ctx, 'formatBillingReport.ctx');
  assertReportableBreakdown(breakdown);
  assertSameTenant(active.tenantId, breakdown.tenantId, 'raport rozliczeniowy');

  if (!Array.isArray(sourceFigures)) {
    throw new TypeError('sourceFigures musi być tablicą kwot oznaczonych jako źródłowe');
  }

  const lines: string[] = [
    'Rozliczenie panelu OEM',
    `Okres: ${breakdown.periodStart} — ${breakdown.periodEnd}`,
    `Zlecenia w okresie: ${String(breakdown.orderCount)}`,
  ];

  if (breakdown.ordersPlnGrosze !== null) {
    lines.push(`Wartość zleceń: ${formatPln(breakdown.ordersPlnGrosze)}`);
  }
  lines.push(`Abonament SaaS: ${formatPln(breakdown.subscriptionPln)}`);

  lines.push(
    breakdown.commissionBasisPoints === null
      ? `Prowizja od zleceń: ${formatPln(breakdown.commissionPln)}`
      : `Prowizja od zleceń (${formatBasisPointsAsPercent(breakdown.commissionBasisPoints)}): ` +
          `${formatPln(breakdown.commissionPln)}`,
  );
  lines.push(`Razem do rozliczenia: ${formatPln(breakdown.totalPln)}`);

  if (breakdown.unpricedOrderCount > 0) {
    lines.push(`Zlecenia bez wyceny, pominięte w prowizji: ${String(breakdown.unpricedOrderCount)}`);
  }
  if (breakdown.notCommissionedOrderCount > 0) {
    lines.push(
      `Zlecenia niezlecone w analizowanym okresie: ${String(breakdown.notCommissionedOrderCount)}`,
    );
  }

  if (sourceFigures.length > 0) {
    lines.push('Dane źródłowe, nie kwota transakcyjna:');
    for (const figure of sourceFigures) {
      lines.push(`- ${formatIndicativeSourceFigure(figure)}`);
    }
  }

  return lines.join('\n');
}

/** 850 bp → `8,50%`. Deterministyczne formatowanie, bez surowej liczby w tekście. */
export function formatBasisPointsAsPercent(basis: CommissionBasisPoints): string {
  const basisPoints = commissionBasisPoints(basis);
  return `${SOURCE_NUMBER_FORMAT.format(basisPoints / 100)}%`;
}

/** Re-export kontraktu wspólnego, żeby raport nie musiał sięgać do `shared/`. */
export type { BillingBreakdown };