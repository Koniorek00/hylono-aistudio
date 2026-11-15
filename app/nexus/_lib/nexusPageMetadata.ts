import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import nexusRouteRegistry from './nexus-route-registry.json';

export type NexusPageMetadataKey =
  | 'workspace'
  | 'academy'
  | 'clients'
  | 'docs'
  | 'fleet'
  | 'service'
  | 'studio'
  | 'supplies'
  | 'team';

export interface NexusPageMetadataConfig {
  title: string;
  description: string;
  path: string;
  forceNoIndex: true;
}

const NEXUS_METADATA_PATH_BY_KEY = Object.fromEntries(
  nexusRouteRegistry.routes.map((route) => [route.key, route.pathname])
) as Record<NexusPageMetadataKey, string>;

export const NEXUS_PAGE_METADATA: Record<NexusPageMetadataKey, NexusPageMetadataConfig> = {
  workspace: {
    title: 'Nexus',
    description:
      'Explore the Hylono Nexus workspace for clinic operations, fleet health, documents, training, and partner workflows.',
    path: NEXUS_METADATA_PATH_BY_KEY.workspace,
    forceNoIndex: true,
  },
  academy: {
    title: 'Nexus Academy',
    description:
      'Preview the Hylono Nexus Academy for partner training, readiness tracking, and clinic onboarding refreshers while the build is in progress.',
    path: NEXUS_METADATA_PATH_BY_KEY.academy,
    forceNoIndex: true,
  },
  clients: {
    title: 'Nexus Clients',
    description:
      'Preview the sample client-record workflow, session-history layout, and protocol-adherence states inside the Hylono Nexus clinic workspace while the build is in progress.',
    path: NEXUS_METADATA_PATH_BY_KEY.clients,
    forceNoIndex: true,
  },
  docs: {
    title: 'Nexus Documents',
    description:
      'Preview consent forms, intake sheets, and protocol-ready clinic documents inside Hylono Nexus while the build is in progress.',
    path: NEXUS_METADATA_PATH_BY_KEY.docs,
    forceNoIndex: true,
  },
  fleet: {
    title: 'Nexus Fleet',
    description:
      'Preview device status, maintenance logs, and service health across the Hylono clinic fleet while the build is in progress.',
    path: NEXUS_METADATA_PATH_BY_KEY.fleet,
    forceNoIndex: true,
  },
  service: {
    title: 'Nexus Service Operations',
    description:
      'Preview Hylono service visit coordination, owner-visible notes, technician tasks, manual references, and replacement-part review workflows.',
    path: NEXUS_METADATA_PATH_BY_KEY.service,
    forceNoIndex: true,
  },
  studio: {
    title: 'Nexus Studio',
    description:
      'Preview clinic-ready marketing assets, branded collateral, and campaign materials inside Hylono Nexus while the build is in progress.',
    path: NEXUS_METADATA_PATH_BY_KEY.studio,
    forceNoIndex: true,
  },
  supplies: {
    title: 'Nexus Supplies',
    description:
      'Preview clinic consumables, accessories, and upgrade parts from the Hylono Nexus supplies workspace while the build is in progress.',
    path: NEXUS_METADATA_PATH_BY_KEY.supplies,
    forceNoIndex: true,
  },
  team: {
    title: 'Nexus Team',
    description:
      'Preview staff progress, role readiness, and clinic compliance tasks in the Hylono Nexus team dashboard while the build is in progress.',
    path: NEXUS_METADATA_PATH_BY_KEY.team,
    forceNoIndex: true,
  },
};

export const createNexusPageMetadata = (key: NexusPageMetadataKey): Metadata =>
  createPageMetadata(NEXUS_PAGE_METADATA[key]);
