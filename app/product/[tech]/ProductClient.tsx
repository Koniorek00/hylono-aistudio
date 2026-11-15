'use client';

import { useRouter } from 'next/navigation';
import { ErrorPage } from '@/components/ErrorPage';
import { TechDetail } from '@/components/TechDetail';
import { HbotRedesignClient } from '@/components/product/hbot/HbotRedesignClient';
import { navigateToPage, navigateWithScroll } from '@/src/lib/navigation';
import { TechType } from '@/types';

interface ProductClientProps {
  hasServerIntro?: boolean;
  tech: string;
}

const parseTechType = (value: string): TechType | null => {
  const normalized = value.toUpperCase();
  const techValues = Object.values(TechType) as string[];
  return techValues.includes(normalized) ? (normalized as TechType) : null;
};

export function ProductClient({ hasServerIntro = false, tech }: ProductClientProps) {
  const router = useRouter();
  const techType = parseTechType(tech);

  const navigateTo = (page: string) => {
    navigateToPage(router, page);
  };

  if (!techType) {
    return <ErrorPage type="404" onNavigate={navigateTo} />;
  }

  if (tech.toLowerCase() === 'hbot') {
    return (
      <div
        data-testid="product-client"
        data-tech="hbot"
        data-has-server-intro={String(hasServerIntro)}
      >
        <HbotRedesignClient />
      </div>
    );
  }

  return (
    <TechDetail
      techId={techType}
      onBack={() => navigateTo('home')}
      onJumpToTech={(nextTech) => {
        navigateWithScroll(router, `/product/${nextTech.toLowerCase()}`);
      }}
      onNavigate={navigateTo}
      serverIntroRendered={hasServerIntro}
    />
  );
}
