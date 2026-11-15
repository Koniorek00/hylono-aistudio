'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusServiceError({ reset }: { error?: Error; reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="Nexus Service"
      modulePurpose="Service visits, scoped notes, task review, and replacement-part draft checks"
      reset={reset}
    />
  );
}
