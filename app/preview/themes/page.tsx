import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import { ThemeExamplesLab } from './ThemeExamplesLab';

export const metadata: Metadata = createPageMetadata({
  title: 'Theme Example Lab | Hylono Preview',
  description:
    'Compare ten noindex Hylono theme examples for the main, renting, and shop page surfaces before choosing a production direction.',
  path: '/preview/themes',
  forceNoIndex: true,
});

// [DECISION: SSG because this is a static noindex theme-selection lab for visual review, not a production route graph change.]
// Rendering strategy: server-rendered preview route with concrete theme examples and links back to the canonical preview, rental, and store surfaces.
export default function PreviewThemeExamplesPage() {
  return <ThemeExamplesLab />;
}
