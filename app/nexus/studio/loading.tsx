import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusStudioLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="Nexus Studio"
      modulePurpose="Campaign drafts, branded collateral previews, and creation-workflow handoff"
    />
  );
}
