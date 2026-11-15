import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusSuppliesLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="Nexus Supplies"
      modulePurpose="Sample inventory search, quantity review, and requisition-draft safeguards"
    />
  );
}
