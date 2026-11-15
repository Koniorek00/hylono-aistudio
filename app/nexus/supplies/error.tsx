'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusSuppliesError({ reset }: { error?: Error; reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="Nexus Supplies"
      modulePurpose="Sample inventory search, quantity review, and requisition-draft safeguards"
      reset={reset}
    />
  );
}
