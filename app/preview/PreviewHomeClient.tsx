'use client';

import { useRouter } from 'next/navigation';
import { navigateWithScroll } from '@/src/lib/navigation';
import { TechType } from '@/types';
import { PreviewHome } from './_components/PreviewHome';

interface PreviewHomeClientProps {
  initialHomepageEnhancementsEnabled?: boolean;
}

export default function PreviewHomeClient({
  initialHomepageEnhancementsEnabled,
}: PreviewHomeClientProps) {
  const router = useRouter();

  const handleSelectTech = (type: TechType) => {
    navigateWithScroll(router, `/product/${type.toLowerCase()}`);
  };

  const handleLaunchBuilder = () => {
    navigateWithScroll(router, '/wellness-planner');
  };

  const handleNavigate = (path: string) => {
    navigateWithScroll(router, path.startsWith('/') ? path : `/${path}`);
  };

  return (
    <PreviewHome
      onSelectTech={handleSelectTech}
      onLaunchBuilder={handleLaunchBuilder}
      onNavigate={handleNavigate}
      homepageEnhancementsEnabled={initialHomepageEnhancementsEnabled}
    />
  );
}
