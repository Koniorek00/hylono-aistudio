import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSocialAuthProviderOptions } from '@/lib/auth-provider-options';
import {
  DEFAULT_AUTH_SUCCESS_PATH,
  resolveLoginRedirectPath,
} from '@/lib/auth-redirect';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import { LoginClient } from './LoginClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Login',
  description: 'Sign in to access your Hylono account or continue to a requested protected page.',
  path: '/login',
  forceNoIndex: true,
});

// [DECISION: SSR because authentication entry experiences are user-state aware.]
// Rendering strategy: request-time server route that resolves session and redirect state while keeping the login surface noindex and robots-disallowed.
export default async function LoginPageRoute({
  searchParams,
}: {
  searchParams: Promise<{
    auth?: string | string[];
    callbackUrl?: string | string[];
    next?: string | string[];
    redirect_to?: string | string[];
  }>;
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const legacyRedirectTo = resolvedSearchParams.redirect_to;
  const callbackPath = resolveLoginRedirectPath(
    {
      next: resolvedSearchParams.next ?? legacyRedirectTo,
      callbackUrl: resolvedSearchParams.callbackUrl,
    },
    {
      baseUrl: process.env.AUTH_URL ?? env.NEXTAUTH_URL ?? env.NEXT_PUBLIC_SITE_URL,
      fallbackPath: DEFAULT_AUTH_SUCCESS_PATH,
    }
  );
  const authRequired =
    resolvedSearchParams.auth === 'required' || typeof legacyRedirectTo !== 'undefined';

  if (session?.user?.email) {
    redirect(callbackPath);
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <LoginClient
        authRequired={authRequired}
        callbackPath={callbackPath}
        socialProviders={getSocialAuthProviderOptions()}
      />
    </div>
  );
}
