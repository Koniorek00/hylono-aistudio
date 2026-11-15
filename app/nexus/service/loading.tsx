import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusServiceLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="Nexus Service"
      modulePurpose="Service visits, scoped notes, task review, and replacement-part draft checks"
    />
  );
}
