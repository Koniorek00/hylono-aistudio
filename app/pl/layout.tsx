import type { ReactNode } from 'react';
import { PolishFooter, PolishNavigation } from './_components/PolishMiniSite';

interface PolishLayoutProps {
  children: ReactNode;
}

// [DECISION: SSG layout shell because the Polish mini-site is static public content with localized chrome and no per-request personalization.]
// Rendering strategy: server-rendered localized navigation and footer for the /pl subtree while the global English site chrome is hidden by RouteChrome.
export default function PolishLayout({ children }: PolishLayoutProps) {
  return (
    <div lang="pl-PL" className="min-h-screen bg-[#070b12] text-white">
      <PolishNavigation />
      {children}
      <PolishFooter />
    </div>
  );
}
