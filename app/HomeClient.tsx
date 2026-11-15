'use client';

import { useRouter } from 'next/navigation';
import { Home } from '@/components/Home';
import analytics from '@/src/lib/analytics';
import { navigateWithScroll } from '@/src/lib/navigation';

interface HomeClientProps {
  initialHomepageEnhancementsEnabled?: boolean;
}

const trackHeroCtaClick = (
  source: string,
  destination: string,
  ctaRole: 'primary' | 'supporting'
) => {
  if (source !== 'hero') {
    return;
  }

  analytics.capture('hero_cta_click', {
    route: '/',
    destination,
    cta_role: ctaRole,
    source,
  });
};

export default function HomeClient({
  initialHomepageEnhancementsEnabled,
}: HomeClientProps) {
  const router = useRouter();

  const handleStartConsultation = (source: string) => {
    trackHeroCtaClick(source, '/consultation', 'primary');
    analytics.capture('home_consultation_cta_clicked', {
      destination: '/consultation',
      source,
    });
    navigateWithScroll(router, '/consultation');
  };

  const handleSeeHowItWorks = (source: string) => {
    const destination = '#home-how-it-works';

    trackHeroCtaClick(source, destination, 'supporting');
    analytics.capture('home_explainer_cta_clicked', {
      destination,
      source,
    });
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const target = document.getElementById('home-how-it-works');
    if (!target) {
      return;
    }

    window.location.hash = destination;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handleOpenPlanner = (source: string) => {
    trackHeroCtaClick(source, '/wellness-planner', 'supporting');
    analytics.capture('home_planner_cta_clicked', {
      destination: '/wellness-planner',
      source,
    });
    navigateWithScroll(router, '/wellness-planner');
  };

  const handleNavigate = (path: string) => {
    navigateWithScroll(router, path.startsWith('/') ? path : `/${path}`);
  };

  return (
    <Home
      onOpenPlanner={handleOpenPlanner}
      onSeeHowItWorks={handleSeeHowItWorks}
      onStartConsultation={handleStartConsultation}
      onNavigate={handleNavigate}
      homepageEnhancementsEnabled={initialHomepageEnhancementsEnabled}
    />
  );
}
