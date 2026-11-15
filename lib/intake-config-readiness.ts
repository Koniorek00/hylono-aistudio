/**
 * Conversion-critical configuration readiness.
 *
 * Every server variable in `lib/env.ts` is `.optional()`. That is deliberate -
 * local development and the test suites must boot without a database, a CRM or
 * an email provider - but it means a PRODUCTION deployment missing them starts
 * perfectly cleanly and the damage only shows up as leads that never arrive.
 *
 * The quietest of those failures is measured, not assumed. In
 * `lib/integrations/n8n.ts` an absent webhook URL returns `status: 'skipped'`
 * with **no operator log at all** (the signing-key branch logs; the absent-URL
 * branch does not). So the submission is accepted, persisted when a database
 * exists, and then simply never reaches the automation. Nothing anywhere says so.
 *
 * This module is the single place that names those variables and states what
 * degrades without each one. It deliberately does NOT throw and does NOT run at
 * import time: the intake routes have real fallbacks, so turning a degraded but
 * working site into a failed boot would be a worse outcome than the leak. It is
 * a report, consumed by `scripts/intake-config-status.ts`.
 *
 * Reading is done through an injected reader rather than the typed `env` proxy,
 * because that proxy refuses server-only keys in the DOM-like environment the
 * route suites run in - the same trap that broke five rental tests when the
 * Turnstile secret was first wired up.
 */

export type IntakeConfigSeverity = 'silent-loss' | 'logged-degradation';

export interface IntakeConfigRequirement {
  /** Environment variable name, exactly as `lib/env.ts` declares it. */
  readonly variable: string;
  /** Which public intake paths depend on it. */
  readonly paths: readonly string[];
  /** Verified behaviour when the value is absent. */
  readonly whenAbsent: string;
  /**
   * `silent-loss`        - degrades with NO operator signal. The dangerous class.
   * `logged-degradation` - degrades but writes an operator log, so it is findable.
   */
  readonly severity: IntakeConfigSeverity;
}

/**
 * Only variables whose absent-behaviour was read from the source are listed.
 * Notification-provider keys (`RESEND_*`, `NOVU_*`) are deliberately NOT listed
 * yet: their absent-path was not traced in this pass, and a truth table with a
 * guessed row is worse than a shorter one.
 */
export const INTAKE_CONFIG_REQUIREMENTS: readonly IntakeConfigRequirement[] = [
  {
    variable: 'N8N_CONTACT_WEBHOOK_URL',
    paths: ['/contact', '/help'],
    whenAbsent:
      "dispatch returns status 'skipped' with no operator log; the enquiry is accepted but never reaches the automation",
    severity: 'silent-loss',
  },
  {
    variable: 'N8N_BOOKING_WEBHOOK_URL',
    paths: ['/consultation'],
    whenAbsent:
      "dispatch returns status 'skipped' with no operator log; the booking request never reaches the automation",
    severity: 'silent-loss',
  },
  {
    variable: 'N8N_RENTAL_WEBHOOK_URL',
    paths: ['/rental/checkout'],
    whenAbsent:
      "dispatch returns status 'skipped' with no operator log; the rental request never reaches the automation",
    severity: 'silent-loss',
  },
  {
    variable: 'N8N_ORDER_WEBHOOK_URL',
    paths: ['/checkout'],
    whenAbsent:
      "dispatch returns status 'skipped' with no operator log; the order never reaches the automation",
    severity: 'silent-loss',
  },
  {
    variable: 'N8N_NEWSLETTER_WEBHOOK_URL',
    paths: ['newsletter forms'],
    whenAbsent:
      "dispatch returns status 'skipped' with no operator log; the subscriber never reaches the automation",
    severity: 'silent-loss',
  },
  {
    variable: 'N8N_WEBHOOK_SIGNING_KEY',
    paths: ['all five intake dispatches'],
    whenAbsent:
      "dispatch returns status 'failed' and writes an operator log; nothing is delivered while a webhook URL is set",
    severity: 'logged-degradation',
  },
  {
    variable: 'DATABASE_URL',
    paths: ['all intake persistence'],
    whenAbsent:
      'persistence drops to the email fallback with an operator log. The lead survives ONLY if RESEND_API_KEY is also set - see refusesSubmissions',
    severity: 'logged-degradation',
  },
  {
    variable: 'RESEND_API_KEY',
    paths: ['operator notification for every intake path'],
    whenAbsent:
      "sendIntakeNotificationEmail returns 'not_configured' and writes an operator log; a stored lead still succeeds but the response degrades from 200 to 202 and nobody is told a lead arrived",
    severity: 'logged-degradation',
  },
  {
    variable: 'NOVU_API_SECRET',
    paths: ['newsletter subscriber and workflow sync'],
    whenAbsent:
      'the Novu client returns early with no log at all; subscriber sync and workflow trigger are skipped. The n8n newsletter dispatch is unaffected, so this is narrower than a lost lead',
    severity: 'silent-loss',
  },
];

export interface IntakeConfigReadiness {
  readonly ok: boolean;
  readonly missing: readonly IntakeConfigRequirement[];
  readonly presentVariables: readonly string[];
  readonly silentLossCount: number;
  /**
   * True when BOTH `DATABASE_URL` and `RESEND_API_KEY` are absent.
   *
   * Read from `resolveIntakeDurability` in `app/api/_shared/intake-durability.ts`:
   * a database write returns accepted (200 when the notification sent, 202 when
   * it did not); an email fallback returns accepted 202 ONLY when the
   * notification sent; every other combination returns
   * `{ accepted: false, status: 503 }`.
   *
   * So with neither configured the intake does not silently lose the lead - it
   * REFUSES the submission with 503 and the visitor sees an error. That is the
   * loudest failure in the system and the single most important thing this
   * report can tell an operator, which is why it is a top-level flag rather than
   * a row someone has to infer.
   */
  readonly refusesSubmissions: boolean;
}

export type EnvReader = (variable: string) => string | undefined;

/** Blank and whitespace-only values count as absent, matching the env schema's `emptyStringAsUndefined`. */
const isAbsent = (value: string | undefined): boolean =>
  value === undefined || value === null || value.trim() === '';

export const describeIntakeConfigReadiness = (read: EnvReader): IntakeConfigReadiness => {
  const missing = INTAKE_CONFIG_REQUIREMENTS.filter((requirement) =>
    isAbsent(read(requirement.variable))
  );
  const presentVariables = INTAKE_CONFIG_REQUIREMENTS.filter(
    (requirement) => !isAbsent(read(requirement.variable))
  ).map((requirement) => requirement.variable);

  return {
    ok: missing.length === 0,
    missing,
    presentVariables,
    silentLossCount: missing.filter((requirement) => requirement.severity === 'silent-loss').length,
    refusesSubmissions: isAbsent(read('DATABASE_URL')) && isAbsent(read('RESEND_API_KEY')),
  };
};

export const formatIntakeConfigReadinessReport = (readiness: IntakeConfigReadiness): string => {
  const lines: string[] = ['Intake configuration readiness'];

  if (readiness.ok) {
    lines.push(
      `READY - all ${INTAKE_CONFIG_REQUIREMENTS.length} conversion-critical variables are set.`
    );
    return lines.join('\n');
  }

  lines.push(
    `INCOMPLETE - ${readiness.missing.length} of ${INTAKE_CONFIG_REQUIREMENTS.length} conversion-critical variables are unset.`,
    `${readiness.silentLossCount} of those degrade with NO operator signal.`,
    ''
  );

  if (readiness.refusesSubmissions) {
    lines.push(
      'REFUSING SUBMISSIONS: neither DATABASE_URL nor RESEND_API_KEY is set, so',
      'resolveIntakeDurability returns 503 and every intake submission is rejected.',
      'Visitors see an error. Fix one of the two before taking traffic.',
      ''
    );
  }

  for (const requirement of readiness.missing) {
    lines.push(
      `- ${requirement.variable} [${requirement.severity}]`,
      `    affects: ${requirement.paths.join(', ')}`,
      `    without it: ${requirement.whenAbsent}`
    );
  }

  if (readiness.presentVariables.length > 0) {
    lines.push('', `Set: ${readiness.presentVariables.join(', ')}`);
  }

  return lines.join('\n');
};
