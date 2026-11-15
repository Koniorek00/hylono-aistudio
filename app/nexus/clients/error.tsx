'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusClientsError({ reset }: { error?: Error; reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="Nexus Clients"
      modulePurpose="Sample client-record review, privacy-safe notes, and workspace access handoff"
      reset={reset}
    />
  );
}
