'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusError({ reset }: { reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="the Nexus workspace"
      modulePurpose="The sample workspace"
      reset={reset}
      showOverviewLink={false}
    />
  );
}
