import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="the Nexus workspace"
      modulePurpose="The sample operator shell"
      showOverviewLink={false}
    />
  );
}
