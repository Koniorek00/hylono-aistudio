import type { ReactNode } from 'react';
import { requireAuthenticatedSession } from '@/lib/auth-guard';

export default async function AuthenticatedAccount({ children }: { children: ReactNode }) {
  await requireAuthenticatedSession('/account');
  return children;
}
