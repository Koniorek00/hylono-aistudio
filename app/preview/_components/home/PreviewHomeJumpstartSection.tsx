import React from 'react';
import { HomeJumpstartSection as CanonicalHomeJumpstartSection } from '@/components/home/HomeJumpstartSection';

interface HomeJumpstartSectionProps {
  homepageEnhancementsEnabled: boolean;
  onNavigate?: (path: string) => void;
}

export function HomeJumpstartSection({
  homepageEnhancementsEnabled,
}: HomeJumpstartSectionProps): React.JSX.Element | null {
  return (
    <CanonicalHomeJumpstartSection
      homepageEnhancementsEnabled={homepageEnhancementsEnabled}
    />
  );
}
