'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusStudioError({ reset }: { error?: Error; reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="Nexus Studio"
      modulePurpose="Campaign drafts, branded collateral previews, and creation-workflow handoff"
      reset={reset}
    />
  );
}
