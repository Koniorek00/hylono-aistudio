import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusClientsLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="Nexus Clients"
      modulePurpose="Sample client-record review, privacy-safe notes, and workspace access handoff"
    />
  );
}
