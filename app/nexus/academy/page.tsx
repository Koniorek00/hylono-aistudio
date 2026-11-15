import { connection } from 'next/server';
import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import { Academy } from '@/components/partner/Academy';
import { auth } from '@/lib/auth';
import { createNexusAcademyAssignmentAction } from '@/src/actions/nexusAcademyActions';
import { listNexusAcademyAssignmentsForSession } from '@/src/actions/nexusAcademyPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

// [DECISION: nexus academy stays server-routed as a temporary public preview while the build-in-progress training workspace remains noindex and interactive behavior stays in a client leaf.]
// Rendering strategy: request-time server routing via `connection()` keeps the training workspace preview fresh while academy interactions stay in the client leaf.

export const metadata = createNexusPageMetadata('academy');

export default async function NexusAcademyPageRoute() {
  await connection();
  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const assignments = await listNexusAcademyAssignmentsForSession(session, profile);

  return (
    <Academy
      createAssignmentAction={createNexusAcademyAssignmentAction}
      initialPersistedAssignments={assignments.assignments}
      persistedAssignmentsStatus={assignments.status}
    />
  );
}
