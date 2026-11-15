import { Suspense, type ReactNode } from 'react';
import AuthenticatedAccount from '@/src/components/layout/AuthenticatedAccount';
import AccountLoading from './loading';

// [DECISION: account layout stays server-enforced because private account content must not render without a verified session.]
// The authentication check owns its loading boundary; it cannot suspend the homepage.
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AuthenticatedAccount>{children}</AuthenticatedAccount>
    </Suspense>
  );
}
