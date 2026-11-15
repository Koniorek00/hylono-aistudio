import type { Metadata } from 'next';
import ClinicalEvidenceMatrix from '@/components/tools/ClinicalEvidenceMatrix';
import { createPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Baza Badań Klinicznych i Dowodów Naukowych HBOT | Hylono EBM Index',
  description: 'Zbiór recenzowanych badań klinicznych (PubMed/Cochrane) nad terapią hiperbaryczną w neurologii, długowieczności, regeneracji sportowej i gojeniu tkanek.',
  path: '/tools/evidence',
  forceNoIndex: true,
});

// [DECISION: /tools/evidence stays noindex,follow because the matrix is an interactive evidence filter, while canonical research records live in content/evidence.ts.]
// Rendering strategy: server-rendered utility shell with the evidence filter grid isolated in a client leaf.

export default function EvidencePage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <ClinicalEvidenceMatrix />
      </div>
    </div>
  );
}
