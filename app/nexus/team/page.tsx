import { connection } from 'next/server';
import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import { TeamDashboard } from '@/components/partner/TeamDashboard';
import { auth } from '@/lib/auth';
import { createNexusTeamHandoffAction } from '@/src/actions/nexusTeamActions';
import { listNexusTeamHandoffsForSession } from '@/src/actions/nexusTeamPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

// [DECISION: nexus team stays server-routed as a temporary public preview while the build-in-progress staff dashboard remains noindex and interactive behavior stays in a client leaf.]
// Rendering strategy: request-time server routing via `connection()` keeps the workspace session-aware while the interactive dashboard remains in a client leaf.

export const metadata = createNexusPageMetadata('team');

export default async function NexusTeamPageRoute() {
  await connection();
  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const persistedHandoffs = await listNexusTeamHandoffsForSession(session, profile);

  return (
    <TeamDashboard
      createHandoffAction={createNexusTeamHandoffAction}
      initialPersistedHandoffs={persistedHandoffs.handoffs}
      persistedHandoffsStatus={persistedHandoffs.status}
    />
  );
}
