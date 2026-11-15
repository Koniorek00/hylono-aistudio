import { ConditionDetailPage, createConditionDetailMetadata } from '../condition-detail-page';

export const metadata = createConditionDetailMetadata('comfort');

// [DECISION: SSG because the comfort guide is a concrete static condition route rendered from in-repo editorial content.]
// Rendering strategy: server-rendered static condition detail wrapper with metadata and content sourced from canonical condition modules.
export default async function ComfortConditionPage() {
  'use cache';

  return <ConditionDetailPage slug="comfort" />;
}
