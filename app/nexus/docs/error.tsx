'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusDocsError({ reset }: { error?: Error; reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="Nexus Docs"
      modulePurpose="Document templates, owner handoffs, consent previews, and support-safe form review"
      reset={reset}
    />
  );
}
