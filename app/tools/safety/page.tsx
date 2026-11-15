import type { Metadata } from 'next';
import InteractiveSafetyAdvisor from '@/components/tools/InteractiveSafetyAdvisor';
import { createPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Kwalifikator Medyczny & Karta Przeciwskazań HBOT | Hylono Clinical Safety',
  description: '5-stopniowy protokół przesiewowy kwalifikacji do sesji hiperbarycznych 1.3 - 2.0 ATA: wykluczenie odmy opłucnowej, interakcje lekowe i weryfikacja implantów.',
  path: '/tools/safety',
  forceNoIndex: true,
});

// [DECISION: /tools/safety stays noindex,follow because the screening flow is an interactive safety utility, not standalone indexable health guidance.]
// Rendering strategy: server-rendered utility shell with the five-step clearance interaction isolated in a client leaf.

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <InteractiveSafetyAdvisor />
      </div>
    </div>
  );
}
