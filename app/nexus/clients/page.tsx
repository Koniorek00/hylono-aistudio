import { connection } from 'next/server';
import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import {
  getFirstNexusRouteParam,
  type NexusRouteSearchParams,
} from '@/app/nexus/_lib/routeSearchParams';
import { Nexus } from '@/components/partner/Nexus';
import { auth } from '@/lib/auth';
import { createNexusClientsIntakeDraftAction } from '@/src/actions/nexusClientsActions';
import { listNexusClientsIntakeDraftsForSession } from '@/src/actions/nexusClientsPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

// [DECISION: nexus clients stays server-routed as a temporary public preview while the build-in-progress CRM surface remains noindex and interactive behavior stays in a client leaf.]
// Rendering strategy: request-time server routing via `connection()` reads route state for the noindex CRM preview while client management stays in the leaf component.

export const metadata = createNexusPageMetadata('clients');

type NexusClientsPageSearchParams = NexusRouteSearchParams<'action' | 'patient'>;

export default async function NexusClientsPageRoute({
  searchParams,
}: {
  searchParams: NexusClientsPageSearchParams;
}) {
  await connection();
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const intakeDrafts = await listNexusClientsIntakeDraftsForSession(session, profile);
  const initialSelectedClientId = getFirstNexusRouteParam(resolvedSearchParams.patient);
  const initialRegistrationOpen =
    getFirstNexusRouteParam(resolvedSearchParams.action) === 'new';

  return (
    <Nexus
      initialSelectedClientId={initialSelectedClientId}
      initialRegistrationOpen={initialRegistrationOpen}
      createIntakeDraftAction={createNexusClientsIntakeDraftAction}
      initialPersistedIntakeDrafts={intakeDrafts.intakeDrafts}
      persistedIntakeDraftsStatus={intakeDrafts.status}
    />
  );
}
