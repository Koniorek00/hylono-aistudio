import { ConditionDetailPage, createConditionDetailMetadata } from '../condition-detail-page';

export const metadata = createConditionDetailMetadata('stress');

// [DECISION: SSG because the stress guide is a concrete static condition route rendered from in-repo editorial content.]
// Rendering strategy: server-rendered static condition detail wrapper with metadata and content sourced from canonical condition modules.
// The body is dispatched to components/conditions/StressSanctuaryContent.tsx, which owns every
// on-page contract except metadata and JSON-LD (both stay in ../condition-detail-page.tsx).
export default async function StressConditionPage() {
  'use cache';

  return <ConditionDetailPage slug="stress" />;
}
