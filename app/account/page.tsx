import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { resolveCustomerIdentity } from '@/lib/customer-identity';
import { createPageMetadata } from '@/lib/seo-metadata';
import { AccountClient } from './AccountClient';

// [DECISION: account route uses dynamic user session context and is treated as SSR by default runtime behavior; reverse if route is redesigned to fully static public profile content.]
// Rendering strategy: request-time server route that reads session state, keeps account content noindex and robots-disallowed, and isolates private interaction in the client leaf.

export const metadata: Metadata = createPageMetadata({
  title: 'Account',
  description: 'Manage your Hylono account, profile details, and access settings in one place.',
  path: '/account',
  forceNoIndex: true,
});

export default async function AccountPageRoute() {
  const session = await auth();
  const identityResult = resolveCustomerIdentity({ session });
  const sessionUser = identityResult.ok
    ? {
        email: identityResult.identity.email,
        name: identityResult.identity.name,
      }
    : null;

  return <AccountClient sessionUser={sessionUser} />;
}
