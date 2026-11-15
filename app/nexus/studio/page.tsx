import { connection } from 'next/server';
import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import {
  getFirstNexusRouteParam,
  type NexusRouteSearchParams,
} from '@/app/nexus/_lib/routeSearchParams';
import { PartnerStudio } from '@/components/partner/PartnerStudio';
import { auth } from '@/lib/auth';
import { createNexusStudioCampaignHandoffAction } from '@/src/actions/nexusStudioActions';
import { listNexusStudioCampaignHandoffsForSession } from '@/src/actions/nexusStudioPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

// [DECISION: nexus studio stays server-routed as a temporary public preview while the build-in-progress creation tool remains noindex and interactive behavior stays in a client leaf.]
// Rendering strategy: request-time server routing via `connection()` reads studio route state for the noindex preview while creation tools stay in the client leaf.

export const metadata = createNexusPageMetadata('studio');

type NexusStudioPageSearchParams = NexusRouteSearchParams<'action'>;

export default async function NexusStudioPageRoute({
  searchParams,
}: {
  searchParams: NexusStudioPageSearchParams;
}) {
  await connection();
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const campaignHandoffs = await listNexusStudioCampaignHandoffsForSession(session, profile);

  return (
    <PartnerStudio
      startFresh={getFirstNexusRouteParam(resolvedSearchParams.action) === 'new'}
      createCampaignHandoffAction={createNexusStudioCampaignHandoffAction}
      initialPersistedCampaignHandoffs={campaignHandoffs.campaignHandoffs}
      persistedCampaignHandoffsStatus={campaignHandoffs.status}
    />
  );
}
