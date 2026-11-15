import { ConditionDetailPage, createConditionDetailMetadata } from '../condition-detail-page';

export const metadata = createConditionDetailMetadata('recovery');

// [DECISION: SSG because the recovery guide is a concrete static condition route rendered from in-repo editorial content.]
// Rendering strategy: server-rendered static condition detail wrapper with metadata and content sourced from canonical condition modules.
export default async function RecoveryConditionPage() {
  'use cache';

  return <ConditionDetailPage slug="recovery" />;
}
