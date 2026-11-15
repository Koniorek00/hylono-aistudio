/**
 * [DECISION: 2026-10-15] Jedna waluta transakcyjna: PLN. Grosze jako liczba
 * całkowita. Moduł istnieje, bo kanon (`03_FOUNDER_DECISION_FRAMEWORKS_GEMS.md`
 * §3 ALWAYS: „Price, quote, and book in PLN; figures in USD/EUR are
 * source-historical or indicative only") zabrania liczenia w obcej walucie,
 * a `number` jako kwota daje cichy błąd 0.01 zł na fakturze.
 *
 * Waluty obce są dozwolone WYŁĄCZNIE jako oznaczenie waluty źródłowej —
 * patrz `indicativeAmount`, która od rzuca kwotę podaną jako PLN.
 */

/** Kwota w złotych. Nominalnie liczba całkowita — grosze. */
export type PlnGrosze = number & { readonly __brand: 'PlnGrosze' };

const GROSZY_W_ZLOTY = 100;

/** Kwoty, które nie są kwotami. Chroni przed `undefined * 100`. */
export type NotYetMoney = number | undefined | null;

export function isPlnGrosze(value: unknown): value is PlnGrosze {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

function assertIntegerGrosze(value: number, label: string): PlnGrosze {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(
      `${label} musi być całkowitą liczbą groszy, otrzymano: ${String(value)}`,
    );
  }
  return value as PlnGrosze;
}

/** Wejście z zapisu dziesiętnego (np. 1499.99) na grosze. Odrzuca resztę. */
export function plnFromDecimal(value: number, label = 'kwota'): PlnGrosze {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} musi być skończoną liczbą, otrzymano: ${String(value)}`);
  }
  const groszy = Math.round(value * GROSZY_W_ZLOTY);
  const roznica = Math.abs(groszy / GROSZY_W_ZLOTY - value);
  if (roznica > 1e-9) {
    throw new RangeError(
      `${label}=${String(value)} nie da się zapisać w groszach — najbliżej ${String(groszy / GROSZY_W_ZLOTY)}`,
    );
  }
  return assertIntegerGrosze(groszy, label);
}

/** Wejście z jawnych groszy. */
export function plnFromGrosze(value: number, label = 'kwota'): PlnGrosze {
  return assertIntegerGrosze(value, label);
}

/**
 * Mnożenie kwoty przez współczynnik. Rzuca, gdy współczynnik daje wynik
 * niecałkowity — rozjazd o jeden grosz na zleceniu jest cichy, a przy
 * thousands zleceń sumuje się do kwoty, której nikt nie umie obronić.
 */
export function multiplyPln(amount: PlnGrosze, factor: number, label = 'mnożnik'): PlnGrosze {
  const product = amount * factor;
  if (!Number.isSafeInteger(product)) {
    throw new RangeError(
      `${label}: ${String(amount)} × ${String(factor)} = ${String(product)} nie jest liczbą całkowitą groszy`,
    );
  }
  return product as PlnGrosze;
}

/** Kwota × procent jako całkowite grosze (np. prowizja 8%). */
export function percentOfPln(amount: PlnGrosze, percentBasisPoints: number): PlnGrosze {
  return multiplyPln(amount, percentBasisPoints / 10_000, 'procent');
}

const PLN_FORMAT = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Wyjście do raportu rozliczeniowego. */
export function formatPln(amount: PlnGrosze): string {
  return PLN_FORMAT.format(amount / GROSZY_W_ZLOTY);
}

/** Waluty obce — wyłącznie jako oznaczenie danych źródłowych. */
export type SourceCurrency = 'USD' | 'EUR' | 'GBP' | 'CHF';

export type IndicativeAmount = {
  readonly kind: 'indicative';
  /** Kwota w walucie źródłowej, jako liczba — NIE jest kwotą transakcyjną. */
  readonly sourceAmount: number;
  readonly sourceCurrency: SourceCurrency;
  readonly note: string;
};

/**
 * Oznaczenie kwoty obcej. Rzuca dla PLN, bo kwota w złotych nie może stać
 * w polu „waluta obca" — to by oznaczało, że cytat przestał być walutą
 * księgową, a pozostał kwotą. Kanon: „Never present EUR (or USD) figures as
 * transactable price" (`08_FOUNDER_CASHFLOW_ALLOCATION_GEMS.md` §3 NEVER).
 */
export function indicativeAmount(
  sourceAmount: number,
  sourceCurrency: SourceCurrency,
  note = 'dane źródłowe, nie kwota transakcyjna',
): IndicativeAmount {
  if (!Number.isFinite(sourceAmount)) {
    throw new RangeError(`kwota źródłowa musi być skończona, otrzymano: ${String(sourceAmount)}`);
  }

  // Kontrola środowiska uruchomieniowego. Typ `SourceCurrency` wyklucza PLN
  // na poziomie kompilacji, ale ta funkcja bywa wołana z danych, które
  // przeszły przez JSON, arkusz albo API zewnętrzne — a tam typ nie chroni
  // przed niczym. Dlatego porównanie idzie przez `String()`: bez niego
  // TypeScript słusznie oznacza porównanie jako nieosiągalne i usuwa je,
  // zostawiając brak ochrony, której ta funkcja obiecuje.
  if (String(sourceCurrency).toUpperCase() === 'PLN') {
    throw new RangeError(
      'kwota w PLN nie może być oznaczona jako waluta obca — to jest kwota transakcyjna',
    );
  }

  return { kind: 'indicative', sourceAmount, sourceCurrency, note };
}

/** Miesięczna opłata SaaS + prowizja od zamówień, wszystko w groszach PLN. */
export type BillingBreakdown = {
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly subscriptionPln: PlnGrosze;
  readonly commissionPln: PlnGrosze;
  readonly orderCount: number;
  readonly totalPln: PlnGrosze;
};

export function billingTotal(subscription: PlnGrosze, commission: PlnGrosze): PlnGrosze {
  const sum = subscription + commission;
  return assertIntegerGrosze(sum, 'suma rozliczenia');
}
