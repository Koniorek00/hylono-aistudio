'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusFleetError({ reset }: { error?: Error; reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="Nexus Fleet"
      modulePurpose="Device readiness, maintenance notes, and service-health preview workflows"
      reset={reset}
    />
  );
}
