import { connection } from 'next/server';
import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import {
  getFirstNexusRouteParam,
  type NexusRouteSearchParams,
} from '@/app/nexus/_lib/routeSearchParams';
import { FleetHealth } from '@/components/partner/FleetHealth';
import { auth } from '@/lib/auth';
import { createNexusFleetServiceLogAction } from '@/src/actions/nexusFleetActions';
import { listNexusFleetServiceLogsForSession } from '@/src/actions/nexusFleetPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

// [DECISION: nexus fleet stays server-routed as a temporary public preview while the build-in-progress operations dashboard remains noindex and interactive behavior stays in a client leaf.]
// Rendering strategy: request-time server routing via `connection()` keeps fleet operations session-aware while maintenance interactions stay inside the client leaf.

export const metadata = createNexusPageMetadata('fleet');

type NexusFleetPageSearchParams = NexusRouteSearchParams<'action' | 'device'>;

export default async function NexusFleetPageRoute({
  searchParams,
}: {
  searchParams: NexusFleetPageSearchParams;
}) {
  await connection();
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const persistedLogs = await listNexusFleetServiceLogsForSession(session, profile);

  return (
    <FleetHealth
      createLogAction={createNexusFleetServiceLogAction}
      initialPersistedLogs={persistedLogs.logs}
      initialSelectedDeviceId={getFirstNexusRouteParam(resolvedSearchParams.device)}
      initialLogAction={getFirstNexusRouteParam(resolvedSearchParams.action) === 'log'}
      persistedLogsStatus={persistedLogs.status}
    />
  );
}
