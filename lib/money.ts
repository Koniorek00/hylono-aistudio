/**
 * Money — the single source of truth for how a price is stored and displayed.
 *
 * WHY THIS EXISTS
 *
 * Before this module the repository had ~85 customer-facing price render sites
 * fed by ~11 independent formatter functions (`formatPln`, `formatEur`,
 * `formatEuro`, `formatStoreEuro`, plus local copies inside six components)
 * and by currency symbols hardcoded straight into display strings. Because a
 * stored price was a bare integer with no currency attached, the SAME number
 * was rendered as EUR on product/rental pages and as PLN in cart, checkout,
 * wishlist and the financing modal. A visitor could read "EUR 24,900" on a
 * product page and then be charged 24,900 PLN at checkout.
 *
 * A bare number cannot carry a currency, so any convention layered on top of
 * one eventually drifts. `Money` makes the currency part of the value, and
 * `formatMoney` is the only sanctioned way to turn it into text.
 *
 * WHICH CURRENCY THE STORED CATALOGUE INTEGERS ARE IN
 *
 * PLN — established by arithmetic, not by assumption. Every one of the 23
 * products in the hydrogen catalogue carries both `grossPrice` and `netPrice`,
 * and for all of them `netPrice === grossPrice / 1.23` exactly:
 *
 *     2590  -> 2105.69      3390  -> 2756.10      31990 -> 26008.13
 *
 * 1.23 is the Polish VAT rate of 23%. A euro price book would not divide by
 * Polish VAT. This agrees with two independent facts: `transactionCurrency`
 * in `content/site-entity.ts` is `'PLN'`, and the cart/checkout path already
 * charges these integers as PLN.
 *
 * SCOPE — WHAT THIS MODULE DELIBERATELY DOES NOT DO
 *
 * It performs no currency CONVERSION and contains no exchange rate. A price in
 * another currency is commercial data that must be supplied deliberately, not
 * derived at render time: a rate applied in the UI would silently reprice ~25k
 * equipment against margin every time the rate moved. Until a EUR price book
 * exists, a EUR market has no EUR price and callers must say so honestly
 * rather than converting.
 */

/** Currencies this platform is allowed to quote. */
export type CurrencyCode = 'PLN' | 'EUR';

/** A price with its currency attached. Construct via `money` or `priceBookMoney`. */
export interface Money {
  readonly amount: number;
  readonly currency: CurrencyCode;
}

/**
 * The currency the stored catalogue integers are denominated in.
 * See the arithmetic proof in this file's header before changing it.
 */
export const PRICE_BOOK_CURRENCY: CurrencyCode = 'PLN';

/** Every currency this module knows how to render, with its display locale. */
const CURRENCY_LOCALES: Readonly<Record<CurrencyCode, string>> = {
  PLN: 'pl-PL',
  EUR: 'de-DE',
};

const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_LOCALES) as CurrencyCode[];

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as string[]).includes(value);
}

export function isMoney(value: unknown): value is Money {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as { amount?: unknown; currency?: unknown };
  return typeof candidate.amount === 'number' && isCurrencyCode(candidate.currency);
}

/**
 * Build a Money value, refusing anything that cannot be a real price.
 *
 * A non-finite or negative amount is rejected at construction rather than
 * rendered as "NaN zł" or a negative total to a customer.
 */
export function money(amount: number, currency: CurrencyCode): Money {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError(`money: amount must be a finite number, received ${String(amount)}`);
  }
  if (amount < 0) {
    throw new RangeError(`money: amount must not be negative, received ${amount}`);
  }
  if (!isCurrencyCode(currency)) {
    throw new TypeError(`money: unsupported currency ${String(currency)}`);
  }
  return { amount, currency };
}

/**
 * Attach the price-book currency to a stored catalogue integer.
 *
 * Use this at the boundary where catalogue data enters the render path, so a
 * bare integer never reaches a formatter.
 */
export function priceBookMoney(amount: number): Money {
  return money(amount, PRICE_BOOK_CURRENCY);
}

/**
 * Render a price-book amount for public marketing copy.
 *
 * Catalogue copy used to hardcode its own currency — `'€24,900'` written as a
 * string literal in `content/goals.ts` and `content/conditions.ts`, against a
 * price book denominated in PLN. That published a five-figure zloty figure as a
 * five-figure euro figure, roughly a fourfold overstatement, and it duplicated
 * prices as display strings that could drift from the price book independently.
 *
 * Copy therefore states the AMOUNT only and never the currency: the currency
 * comes from `PRICE_BOOK_CURRENCY`, in one place, for every surface at once.
 */
export function priceBookText(
  amount: number,
  options: FormatMoneyOptions = {},
): string {
  return formatMoney(priceBookMoney(amount), options);
}

/** The same, in the recurring-price shape catalogue copy uses. */
export function priceBookMonthlyText(
  amount: number,
  options: FormatMoneyOptions = {},
): string {
  return `${priceBookText(amount, options)}/mo`;
}

/**
 * The price book's currency symbol alone, with no amount.
 *
 * For labels and input placeholders — "Min zł/mo" — where there is no figure to
 * format but the field still has to say which currency it wants. Derived from
 * `Intl` rather than typed as a literal, so it follows `PRICE_BOOK_CURRENCY`
 * instead of becoming the next hardcoded currency claim.
 */
export function priceBookCurrencySymbol(): string {
  const parts = new Intl.NumberFormat(CURRENCY_LOCALES[PRICE_BOOK_CURRENCY], {
    style: 'currency',
    currency: PRICE_BOOK_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0);

  return parts.find((part) => part.type === 'currency')?.value ?? PRICE_BOOK_CURRENCY;
}

/**
 * A price a customer can actually be charged.
 *
 * Zero is a real value but is not a sellable price — the repository has
 * already shipped a bug where a missing catalogue lookup put a zero-price
 * device in the cart. Call this before offering a purchase action.
 */
export function isPayable(value: Money): boolean {
  return value.amount > 0;
}

export interface FormatMoneyOptions {
  /** Override the currency's default display locale. */
  readonly locale?: string;
  /**
   * Force decimal places. Omitted: whole amounts render without decimals
   * (24 900 zł), fractional amounts render with two (2 105,69 zł).
   */
  readonly fractionDigits?: number;
  /**
   * `'symbol'` (default) renders `24 900 zł`; `'code'` renders `24 900 PLN`.
   * The purchase path uses `'code'` because that is the form it already
   * showed before this module existed — migrating it was a correctness fix,
   * not a licence to reword prices.
   */
  readonly currencyDisplay?: 'symbol' | 'code';
}

function buildFormatter(value: Money, options: FormatMoneyOptions): Intl.NumberFormat {
  const digits = options.fractionDigits ?? (Number.isInteger(value.amount) ? 0 : 2);

  return new Intl.NumberFormat(options.locale ?? CURRENCY_LOCALES[value.currency], {
    style: 'currency',
    currency: value.currency,
    currencyDisplay: options.currencyDisplay ?? 'symbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function assertRenderable(value: Money, caller: string): void {
  if (!isMoney(value)) {
    throw new TypeError(
      `${caller}: expected a Money value with an explicit currency. ` +
        'Wrap stored catalogue integers with priceBookMoney() instead of passing a bare number.',
    );
  }
  if (!Number.isFinite(value.amount)) {
    throw new TypeError(`${caller}: amount must be finite, received ${String(value.amount)}`);
  }
}

/**
 * The ONLY sanctioned way to render a price as text.
 *
 * Because it takes a `Money` and not a number, a call site cannot render an
 * amount without having stated its currency. The locale is always explicit,
 * which is the second bug this replaces: `Number.toLocaleString()` with no
 * locale formats according to the SERVER's locale, so the same price rendered
 * as `24 900 PLN`, `24,900 PLN` or `24.900 PLN` depending on where it ran —
 * and a Polish reader parses that last one as twenty-four zloty ninety.
 */
export function formatMoney(value: Money, options: FormatMoneyOptions = {}): string {
  assertRenderable(value, 'formatMoney');
  return buildFormatter(value, options).format(value.amount);
}

/**
 * The same rendering, split into its amount and currency text.
 *
 * For a call site that styles the currency differently from the number. It
 * exists so such a site does not have to hardcode `PLN` in markup to keep its
 * styling — the currency still comes from the value.
 */
export function formatMoneyParts(
  value: Money,
  options: FormatMoneyOptions = {},
): { readonly amount: string; readonly currency: string } {
  assertRenderable(value, 'formatMoneyParts');

  const parts = buildFormatter(value, options).formatToParts(value.amount);
  const currency = parts
    .filter((part) => part.type === 'currency')
    .map((part) => part.value)
    .join('');
  const amount = parts
    .filter((part) => part.type !== 'currency')
    .map((part) => part.value)
    .join('')
    .trim();

  return { amount, currency };
}

/**
 * Add prices, refusing to mix currencies.
 *
 * This is the guard that makes a wrong cart total impossible rather than
 * merely unlikely: summing a PLN line and a EUR line throws instead of
 * producing a meaningless number that would be charged to a customer.
 */
export function sumMoney(values: readonly Money[]): Money {
  if (values.length === 0) {
    throw new RangeError('sumMoney: cannot sum an empty list — the currency would be unknown');
  }

  const [first, ...rest] = values;
  if (!isMoney(first)) {
    throw new TypeError('sumMoney: every entry must be a Money value');
  }

  let total = first.amount;
  for (const entry of rest) {
    if (!isMoney(entry)) {
      throw new TypeError('sumMoney: every entry must be a Money value');
    }
    if (entry.currency !== first.currency) {
      throw new TypeError(
        `sumMoney: refusing to add ${entry.currency} to ${first.currency}. ` +
          'Convert deliberately with a supplied price book; there is no render-time exchange rate.',
      );
    }
    total += entry.amount;
  }

  return money(total, first.currency);
}

/** Multiply a price by a whole quantity, keeping the currency. */
export function multiplyMoney(value: Money, quantity: number): Money {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError(`multiplyMoney: quantity must be a non-negative integer, received ${quantity}`);
  }
  return money(value.amount * quantity, value.currency);
}
