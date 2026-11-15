import type { Metadata } from 'next';
import HBOTProtocolCalculator from '@/components/tools/HBOTProtocolCalculator';
import { createPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Kalkulator Protokołów Hiperbarycznych & Nasycenia Osocza | Hylono',
  description: "Precyzyjne wyliczanie parametrów pO2, rozpuszczalności tlenu w osoczu wg Prawa Henry'ego oraz adaptacji komórkowej dla komór 1.3 - 2.0 ATA.",
  path: '/tools/calculator',
  forceNoIndex: true,
});

// [DECISION: /tools/calculator stays noindex,follow because the protocol calculator is an interactive utility that does not carry standalone review/freshness ownership.]
// Rendering strategy: server-rendered utility shell with Henry's-law calculation state isolated in a client leaf.

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <HBOTProtocolCalculator />
      </div>
    </div>
  );
}
