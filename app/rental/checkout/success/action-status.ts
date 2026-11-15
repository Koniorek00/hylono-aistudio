/**
 * Accessibility contract for the rental checkout success page.
 *
 * These two constants used to be exported from `page.tsx`. They had to move, and
 * the reason is worth stating so nobody moves them back:
 *
 * Next generates a type validator for every `page.tsx` that constrains the
 * module's exports to the page surface (`default`, `metadata`, `viewport`,
 * `dynamic`, `config`, `generateStaticParams`, and the rest). A page exporting
 * anything else fails the production build with
 *
 *   Property 'RENTAL_CHECKOUT_SUCCESS_ACTION_STATUS_ID' is incompatible with
 *   index signature. Type '"rental-checkout-success-action-status"' is not
 *   assignable to type 'never'.
 *
 * That check lives in Next's generated `.next/types`, NOT in the app's own
 * tsconfig program - so `tsc --noEmit` passes until a build has generated those
 * types, which is why this sat undetected.
 *
 * The values are moved verbatim. The page still owns the markup; this module owns
 * only the shared id and status string so the page and its test agree on them.
 */

/** `id` of the live-status element the follow-up actions describe. */
export const RENTAL_CHECKOUT_SUCCESS_ACTION_STATUS_ID =
  'rental-checkout-success-action-status';

/** Default status text announced when the follow-up actions are available. */
export const RENTAL_CHECKOUT_SUCCESS_ACTION_READY_STATUS =
  'Rental checkout follow-up actions are available for the rental hub, support contact, and terms review.';
