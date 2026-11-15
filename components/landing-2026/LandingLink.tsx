'use client';

import type { ReactNode } from 'react';
import analytics from '@/src/lib/analytics';

/** Native navigation remains functional without JavaScript; analytics respects consent. */
export function LandingLink({
  href,
  children,
  className,
  source,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  source: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        if (source === 'hero')
          analytics.capture('hero_cta_click', {
            route: '/',
            destination: href,
            cta_role: primary ? 'primary' : 'supporting',
            source,
          });
        if (href === '/consultation')
          analytics.capture('home_consultation_cta_clicked', { destination: href, source });
        analytics.capture('home_access_path_clicked', { route: '/', destination: href, source });
      }}
    >
      {children}
    </a>
  );
}
