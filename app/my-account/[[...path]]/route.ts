import { NextResponse } from 'next/server';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';

const legacyAuthAliasHeaders = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
} as const;

const redirectToCanonicalAccount = (request: Request) =>
  NextResponse.redirect(new URL(buildLoginRedirectPath('/account'), request.url), {
    status: 308,
    headers: legacyAuthAliasHeaders,
  });

// [DECISION: legacy /my-account aliases stay as a server-only redirect shim so the public site always resolves into the canonical account auth flow.]
// Rendering strategy: route handler issues a permanent server redirect to the noindex login/account flow with crawl-removal headers and no renderable duplicate page.
export function GET(request: Request) {
  return redirectToCanonicalAccount(request);
}

export function HEAD(request: Request) {
  return redirectToCanonicalAccount(request);
}
