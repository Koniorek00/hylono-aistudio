'use client';

import { useRouter } from 'next/navigation';
import { ErrorPage } from '@/components/ErrorPage';
import { FeatureGate } from '@/components/FeatureGate';
import { navigateToPage } from '@/src/lib/navigation';
import { Rental2LandingPage } from './Rental2LandingPage';

export function Rental2Client() {
  const router = useRouter();

  const navigateTo = (page: string) => {
    navigateToPage(router, page);
  };

  return (
    <FeatureGate
      flag="feature_rental_landing"
      fallback={<ErrorPage type="404" onNavigate={navigateTo} />}
    >
      <Rental2LandingPage onNavigate={navigateTo} />
    </FeatureGate>
  );
}
