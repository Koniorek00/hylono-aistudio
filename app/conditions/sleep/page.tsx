import { ConditionDetailPage, createConditionDetailMetadata } from '../condition-detail-page';

export const metadata = createConditionDetailMetadata('sleep');

// [DECISION: SSG because the sleep guide is a concrete static condition route rendered from in-repo editorial content.]
// Rendering strategy: server-rendered static condition detail wrapper with metadata and content sourced from canonical condition modules.
export default async function SleepConditionPage() {
  'use cache';

  return <ConditionDetailPage slug="sleep" />;
}
