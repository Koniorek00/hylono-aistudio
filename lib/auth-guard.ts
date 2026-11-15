import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { resolveCustomerIdentity } from '@/lib/customer-identity';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';

export async function requireAuthenticatedSession(pathname: string) {
  const session = await auth();
  const identityResult = resolveCustomerIdentity({ session });

  if (!identityResult.ok) {
    redirect(buildLoginRedirectPath(pathname));
  }

  return session;
}
