import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusAcademyLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="Nexus Academy"
      modulePurpose="Training readiness, onboarding refreshers, and approved learning paths"
    />
  );
}
