/**
 * Checkout pricing and payment-message contract.
 *
 * These helpers used to be exported from `app/api/checkout/route.ts`. They had to
 * move, and the reason is worth stating so nobody moves them back:
 *
 * Next generates a type validator for every `route.ts` that constrains the
 * module's exports to the route surface (`GET`, `POST`, `dynamic`, `config`, and
 * the rest). A route file exporting anything else fails the production build with
 *
 *   Type 'OmitWithTag<typeof import(".../app/api/checkout/route"), "GET" | "POST"
 *   | ...>' does not satisfy the constraint '{ [x: string]: never; }'
 *
 * That check lives in Next's generated `.next/types`, NOT in the app's own
 * tsconfig program - so `tsc --noEmit` passes while `next build` fails. The three
 * helpers below were the disallowed exports.
 *
 * The code no longer reads a price out of a display string. It used to take
 * `TECH_DETAILS[techType].price` — a DOLLAR string such as `'$18,900'` — strip
 * every non-digit, multiply by 100 and hand the result to the payment layer as
 * PLN minor units. `'$18,900'` became 1_890_000, so a direct `POST /api/checkout`
 * with `tech-hbot` charged 18 900.00 PLN for a device published at 24 900 zł.
 * Prices now come from the PLN catalogue integers in `content/products.ts`, and
 * the currency-stripping parser is deleted rather than left behind.
 */
import { productById } from '@/content/products';
import { PRICE_BOOK_CURRENCY } from '@/lib/money';
import { TechType } from '@/types';

/**
 * The payment layer charges `amount: String(totalCents)` with `currency: 'pln'`
 * (`app/api/checkout/route.ts:184-191`), so every minor unit returned below is a
 * PLN minor unit and nothing else. The catalogue integers are denominated in
 * `PRICE_BOOK_CURRENCY`, and this repository deliberately holds no exchange rate
 * to convert them with — see `lib/money.ts`.
 *
 * So if the price book's currency ever changes, each returned number silently
 * becomes a mis-charge again, and it would do so invisibly: the amounts would
 * still be integers and the route would still accept them. Refuse to load
 * instead. A single missing product price fails one cart line through the `null`
 * path; a wrong currency fails every line of every cart.
 */
if (PRICE_BOOK_CURRENCY !== 'PLN') {
  throw new Error(
    'checkout-pricing: the payment layer charges PLN minor units, but PRICE_BOOK_CURRENCY is ' +
      `'${PRICE_BOOK_CURRENCY}'. This repository has no exchange rate, so the catalogue cannot be ` +
      'converted at render time — reprice the catalogue in PLN or re-issue the payment path ' +
      'deliberately.'
  );
}

const TECH_ID_TO_TYPE: Record<string, TechType> = {
  'tech-hbot': TechType.HBOT,
  'tech-pemf': TechType.PEMF,
  'tech-rlt': TechType.RLT,
  'tech-hydrogen': TechType.HYDROGEN,
  'tech-ewot': TechType.EWOT,
  'tech-sauna_blanket': TechType.SAUNA_BLANKET,
  'tech-ems': TechType.EMS,
  'tech-vns': TechType.VNS,
  'tech-hypoxic': TechType.HYPOXIC,
  'tech-cryo': TechType.CRYO,
};

/**
 * Only these categories may be priced from the catalogue on the server. Anything
 * else must be quoted by a human, so an unknown or untrusted id returns null and
 * the caller refuses the line rather than inventing a price.
 */
const CHECKOUT_TRUSTED_TECH_TYPES = new Set<TechType>([TechType.HBOT, TechType.HYDROGEN]);

/**
 * The catalogue product behind each allowlisted tech.
 *
 * This is the only place on the payment path where a cart id becomes a price, and
 * it is a hand-written map on purpose. The ids the client actually sends
 * (`tech-${id.toLowerCase()}`, `components/TechDetail.tsx:271`;
 * `'tech-hbot'`, `app/product/hbot2/Hbot2ProductDetail.tsx:523`) are a different
 * namespace from the catalogue product ids in `content/products.ts`, so joining
 * them by shape or by a substring match would be a second, unverified parser.
 */
const TECH_TYPE_TO_PRODUCT_ID: Partial<Record<TechType, string>> = {
  [TechType.HBOT]: 'hbot-st1700',
  [TechType.HYDROGEN]: 'h2-hop450',
};

export const getTrustedUnitPriceCents = (itemId: string): number | null => {
  const techType = TECH_ID_TO_TYPE[itemId.trim().toLowerCase()];

  if (!techType || !CHECKOUT_TRUSTED_TECH_TYPES.has(techType)) {
    return null;
  }

  const productId = TECH_TYPE_TO_PRODUCT_ID[techType];

  if (!productId) {
    return null;
  }

  const purchasePrice = productById[productId]?.purchasePrice;

  // Fail closed on a bad catalogue entry. A non-integer, zero or negative price
  // would otherwise become a fractional or negative charge, which the checkout
  // route cannot distinguish from a real price once it is a minor-unit number.
  if (typeof purchasePrice !== 'number' || !Number.isInteger(purchasePrice) || purchasePrice <= 0) {
    return null;
  }

  const unitPriceCents = purchasePrice * 100;

  return Number.isSafeInteger(unitPriceCents) ? unitPriceCents : null;
};

export const resolveStripePaymentIntentFailureMessage = (): string =>
  'Stripe payment intent creation failed.';

export const resolveStripePaymentConfigurationMessage = (): string =>
  'Card payment provider is not configured.';
