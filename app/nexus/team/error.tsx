'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusTeamError({ reset }: { error?: Error; reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="Nexus Team"
      modulePurpose="Team readiness, assignment preview, and sample staff-workspace handoff"
      reset={reset}
    />
  );
}
