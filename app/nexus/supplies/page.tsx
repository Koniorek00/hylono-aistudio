import { connection } from 'next/server';
import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import { SupplyShop } from '@/components/partner/SupplyShop';
import { auth } from '@/lib/auth';
import { createNexusSuppliesRequisitionAction } from '@/src/actions/nexusSuppliesActions';
import { listNexusSuppliesRequisitionsForSession } from '@/src/actions/nexusSuppliesPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

// [DECISION: nexus supplies stays server-routed as a temporary public preview while the build-in-progress reordering workspace remains noindex and interactive behavior stays in a client leaf.]
// Rendering strategy: request-time server routing via `connection()` keeps the noindex supplies preview current while requisition actions stay in the client leaf.

export const metadata = createNexusPageMetadata('supplies');

export default async function NexusSuppliesPageRoute() {
  await connection();

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const requisitions = await listNexusSuppliesRequisitionsForSession(session, profile);

  return (
    <SupplyShop
      createRequisitionAction={createNexusSuppliesRequisitionAction}
      initialPersistedRequisitions={requisitions.requisitions}
      persistedRequisitionsStatus={requisitions.status}
    />
  );
}
