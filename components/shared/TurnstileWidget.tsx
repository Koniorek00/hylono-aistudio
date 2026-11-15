'use client';

import Script from 'next/script';
import { readRuntimeEnv } from '@/lib/env';

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js';

/** Shared id so the script is injected once even when a page renders several forms. */
const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile';

/**
 * Cloudflare Turnstile challenge for the public intake forms.
 *
 * Renders **nothing** unless `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set. That is the whole
 * safety property of this component: with no key configured no script is requested, no
 * iframe is created, and the forms behave exactly as before, so adding the file cannot
 * change the current site.
 *
 * When a key IS set, the Cloudflare script replaces the placeholder div with a hidden
 * input named `cf-turnstile-response`. That field name is already read and forwarded by
 * `readCaptchaTokenValue` in `src/actions/formActions.ts` and verified server-side by
 * `app/api/_shared/spam-gate.ts` - so no wiring beyond rendering is needed.
 *
 * The script origin must also be allowed by the CSP `script-src` and `frame-src`
 * directives in `proxy.ts`, or the widget is blocked silently.
 */
export const TurnstileWidget = () => {
  const siteKey = readRuntimeEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY')?.trim();

  if (!siteKey) {
    return null;
  }

  return (
    <>
      <Script
        id={TURNSTILE_SCRIPT_ID}
        src={TURNSTILE_SCRIPT_SRC}
        strategy="lazyOnload"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="dark"
        data-size="flexible"
      />
    </>
  );
};

export default TurnstileWidget;
