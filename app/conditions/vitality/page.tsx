import { ConditionDetailPage, createConditionDetailMetadata } from '../condition-detail-page';

export const metadata = createConditionDetailMetadata('vitality');

// [DECISION: SSG because the vitality guide is a concrete static condition route rendered from in-repo editorial content.]
// Rendering strategy: server-rendered static condition detail wrapper with metadata and content sourced from canonical condition modules.
export default async function VitalityConditionPage() {
  'use cache';

  return <ConditionDetailPage slug="vitality" />;
}
