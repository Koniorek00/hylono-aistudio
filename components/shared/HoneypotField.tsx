import { SPAM_HONEYPOT_FIELD } from '@/lib/spam-gate-fields';

/**
 * Decoy input for the public intake forms.
 *
 * A real visitor never sees it, never tabs to it and never fills it, so any submission
 * carrying a value is refused by the server spam gate in
 * `app/api/_shared/spam-gate.ts`. Automated form fillers that populate every input walk
 * straight into it.
 *
 * Deliberate choices:
 * - Hidden by off-screen positioning, not `display: none` or `type="hidden"`. A field
 *   that is trivially detectable as hidden is skipped by the bots worth catching.
 * - `aria-hidden` on the wrapper plus `tabIndex={-1}`, so it is invisible to screen
 *   readers and unreachable by keyboard. It must never appear in a real user's path.
 * - `autoComplete="off"` and no `id`, so no browser autofill heuristic and no duplicate
 *   id when a page renders more than one intake form.
 * - Inline styles rather than utility classes, so the field cannot be un-hidden by a
 *   stylesheet change or a purge of unused CSS.
 */
export const HoneypotField = () => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      left: '-9999px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    }}
  >
    <input
      type="text"
      name={SPAM_HONEYPOT_FIELD}
      tabIndex={-1}
      autoComplete="off"
      defaultValue=""
    />
  </div>
);

export default HoneypotField;
