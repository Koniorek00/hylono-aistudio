import type { IntakeDispatchResult } from '@/lib/integrations/n8n';

const WORKFLOW_SYNC_DELAY_NOTICE =
  ' Workflow sync is delayed; fallback review may be required.';

/**
 * True only when the workflow dispatch actually FAILED and may still be retried or
 * reviewed - `ok === false`, carrying `non_2xx`, `network` or
 * `unsigned_production_webhook`.
 *
 * `status === 'skipped'` is deliberately NOT delayed. Its only reason is
 * `not_configured` (see the IntakeDispatchResult union), which means no webhook was
 * ever set, so there is no sync in flight to be late. Saying "delayed" there is
 * untrue in both directions: the customer is told to expect a hand-off that will
 * never arrive, and an operator triaging the reply waits for a sync that cannot come.
 *
 * The absent-integration case is not silent overall - it raises
 * N8N_WEBHOOK_NOT_CONFIGURED_LOG_MESSAGE at error level in production, once per
 * target. That is the right audience for it: a missing internal integration is an
 * operator's problem, and the lead itself is still held by the database row or the
 * fallback email.
 */
export const isIntakeWorkflowSyncDelayed = (
  result: IntakeDispatchResult | undefined
): boolean => result?.ok === false;

export const appendIntakeWorkflowSyncDelayNotice = (
  message: string,
  result: IntakeDispatchResult | undefined
): string =>
  isIntakeWorkflowSyncDelayed(result)
    ? `${message}${WORKFLOW_SYNC_DELAY_NOTICE}`
    : message;
