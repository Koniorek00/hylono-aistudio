import type { Metadata } from 'next';
import FinancingROICalculator from '@/components/tools/FinancingROICalculator';
import { createPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Kalkulator Rentowności i Finansowania HBOT | Hylono B2B Fleet',
  description: 'Biznesplan i kalkulacja zwrotu z inwestycji (ROI) dla gabinetów, klinik i centrów medycznych wdrażających komory hiperbaryczne Hylono.',
  path: '/tools/roi',
  forceNoIndex: true,
});

// [DECISION: /tools/roi stays noindex,follow because the ROI model is an interactive commercial estimator without published canonical pricing.]
// Rendering strategy: server-rendered utility shell with financing-state calculation isolated in a client leaf.

export default function ROIPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <FinancingROICalculator />
      </div>
    </div>
  );
}
