import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusFleetLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="Nexus Fleet"
      modulePurpose="Device readiness, maintenance notes, and service-health preview workflows"
    />
  );
}
