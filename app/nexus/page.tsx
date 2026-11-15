import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import { DashboardHome } from '@/components/partner/DashboardHome';

// [DECISION: nexus workspace root renders the DashboardHome overview panel, matching the canonical nexus route registry.]
// Rendering strategy: server-rendered overview with client module cards and crawlable links; noindex preview.

export const metadata = createNexusPageMetadata('workspace');

export default function NexusPageRoute() {
  return <DashboardHome />;
}
