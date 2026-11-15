'use client';

import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusAcademyError({ reset }: { error?: Error; reset: () => void }) {
  return (
    <NexusModuleRouteState
      mode="error"
      moduleName="Nexus Academy"
      modulePurpose="Training readiness, onboarding refreshers, and approved learning paths"
      reset={reset}
    />
  );
}
