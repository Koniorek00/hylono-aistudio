import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusTeamLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="Nexus Team"
      modulePurpose="Team readiness, assignment preview, and sample staff-workspace handoff"
    />
  );
}
