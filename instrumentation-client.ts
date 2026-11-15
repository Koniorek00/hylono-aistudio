import type * as SentryTypes from '@sentry/nextjs';
import { readPublicRuntimeEnv } from './utils/featureFlagEnv';

const sentryDsn = readPublicRuntimeEnv('NEXT_PUBLIC_SENTRY_DSN');

const runtimeEnvironment =
  readPublicRuntimeEnv('NEXT_PUBLIC_RUNTIME_ENV') ??
  readPublicRuntimeEnv('NEXT_PUBLIC_NODE_ENV') ??
  'development';

/**
 * Error telemetry is **not** started at module scope any more.
 *
 * `Sentry.init()` used to run here unconditionally on every page load, before any consent
 * check, which meant the Sentry SDK - including its global error handlers and outbound
 * requests - was active for a visitor who had declined analytics and had never been asked.
 * That does not match how the rest of this project treats telemetry: see
 * `ConsentAwareVercelTelemetry.tsx`, which starts `enabled = false` and only renders
 * after `parsed.analytics === true` AND a string `version`.
 *
 * `startSentryWithConsent()` applies that same gate and is called from
 * `src/components/providers/Providers.tsx`, inside the block that already initialises
 * PostHog once consent is verified. It is idempotent, so the consent event, a remount, and
 * React 18 StrictMode double-invocation all resolve to a single `Sentry.init`.
 */
let sentryStarted = false;
let sentryModule: typeof SentryTypes | null = null;

export const startSentryWithConsent = (): void => {
  if (sentryStarted || !sentryDsn) {
    return;
  }

  sentryStarted = true;

  // Download the SDK only after the same consent gate that starts telemetry.
  void import('@sentry/nextjs')
    .then((Sentry) => {
      sentryModule = Sentry;
      Sentry.init({
        dsn: sentryDsn,
        environment: runtimeEnvironment,
        tracesSampleRate: 0.1,
        // Preserved deliberately: even after consent, error events must not carry request
        // headers, cookies, IP addresses or user context by default.
        sendDefaultPii: false,
      });
    })
    .catch(() => {
      sentryStarted = false;
    });
};

/**
 * Preserve Next's router-transition signature without loading the SDK before consent.
 */
export const onRouterTransitionStart = (
  ...args: Parameters<typeof SentryTypes.captureRouterTransitionStart>
): void => {
  sentryModule?.captureRouterTransitionStart(...args);
};
