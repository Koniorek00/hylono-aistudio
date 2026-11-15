'use client';

import { useRouter } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { ErrorPage } from '@/components/ErrorPage';
import { ProtocolExplorer } from '@/components/ProtocolExplorer';
import { navigateToPage } from '@/src/lib/navigation';

export function ProtocolDetailClient({
  hideDetailIntro = false,
  slug,
}: {
  hideDetailIntro?: boolean;
  slug: string;
}) {
  const router = useRouter();

  const navigateTo = (page: string) => {
    navigateToPage(router, page);
  };

  return (
    <FeatureGate
      flag="feature_protocols_detail"
      fallback={<ErrorPage type="404" onNavigate={navigateTo} />}
    >
      <ProtocolExplorer hideDetailIntro={hideDetailIntro} slug={slug} onNavigate={navigateTo} />
    </FeatureGate>
  );
}
