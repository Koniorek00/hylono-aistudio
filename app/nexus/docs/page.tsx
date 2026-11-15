import { connection } from 'next/server';
import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import { ClientDocs } from '@/components/partner/ClientDocs';
import { auth } from '@/lib/auth';
import { createNexusDocsDocumentPacketAction } from '@/src/actions/nexusDocsActions';
import { listNexusDocsDocumentPacketsForSession } from '@/src/actions/nexusDocsPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

// [DECISION: nexus docs stays server-routed as a temporary public preview while the build-in-progress document workspace remains noindex and interactive behavior stays in a client leaf.]
// Rendering strategy: request-time server routing via `connection()` keeps the noindex document preview current while document actions stay in the client leaf.

export const metadata = createNexusPageMetadata('docs');

export default async function NexusDocsPageRoute() {
  await connection();

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const documentPackets = await listNexusDocsDocumentPacketsForSession(session, profile);

  return (
    <ClientDocs
      prepareDocumentPacketAction={createNexusDocsDocumentPacketAction}
      initialPersistedDocumentPackets={documentPackets.documentPackets}
      persistedDocumentPacketsStatus={documentPackets.status}
    />
  );
}
