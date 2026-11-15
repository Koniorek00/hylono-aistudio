import { NexusModuleRouteState } from '@/app/nexus/_components/NexusModuleRouteState';

export default function NexusDocsLoading() {
  return (
    <NexusModuleRouteState
      mode="loading"
      moduleName="Nexus Docs"
      modulePurpose="Document templates, owner handoffs, consent previews, and support-safe form review"
    />
  );
}
