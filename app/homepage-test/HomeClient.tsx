'use client';

import { useRouter } from 'next/navigation';
import { Home } from '@/components/Home';
import { buildHomeContactHref } from '@/lib/contact-prefill';
import analytics from '@/src/lib/analytics';
import { navigateWithScroll } from '@/src/lib/navigation';

interface HomeClientProps {
  initialHomepageEnhancementsEnabled?: boolean;
}

const resolveHref = ({
  pathname,
  query,
}: ReturnType<typeof buildHomeContactHref>) => {
  const search = new URLSearchParams(
    Object.entries(query).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value;
      }

      return acc;
    }, {})
  ).toString();

  return search ? `${pathname}?${search}` : pathname;
};

export default function HomeClient({
  initialHomepageEnhancementsEnabled,
}: HomeClientProps) {
  const router = useRouter();

  const handleStartConsultation = (source: string) => {
    analytics.capture('home_consultation_cta_clicked', {
      destination: '/contact',
      source,
    });
    navigateWithScroll(router, resolveHref(buildHomeContactHref()));
  };

  const handleSeeHowItWorks = (source: string) => {
    analytics.capture('home_explainer_cta_clicked', {
      destination: '#home-how-it-works',
      source,
    });
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('home-how-it-works')?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handleOpenPlanner = (source: string) => {
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
