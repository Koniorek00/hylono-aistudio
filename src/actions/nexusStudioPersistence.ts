'use server';

import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import {
  getNexusStudioActionBoundary,
  isNexusStudioActionId,
  isPlausibleNexusStudioCampaignHandoff,
  type NexusStudioActionInput,
} from '@/content/nexus-studio-persistence-contract';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { nexusStudioCampaignHandoffsTable } from '@/lib/db/schema';
import type { NexusStudioPersistedCampaignHandoff } from '@/src/actions/nexusStudioActionCore';
import { formatNexusPersistedDateLabel } from '@/src/actions/nexusPersistenceLabels';
import {
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusStudioPersistenceWriteResult =
  | {
      persisted: true;
      recordId: string;
    }
  | {
      persisted: false;
      reason:
        | 'database_not_configured'
        | 'database_error'
        | 'auth_context_missing'
        | 'role_not_allowed'
        | 'scope_not_allowed';
    };

export type NexusStudioPersistedCampaignHandoffListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing'
  | 'role_not_allowed';

export interface NexusStudioPersistedCampaignHandoffListResult {
  status: NexusStudioPersistedCampaignHandoffListStatus;
  campaignHandoffs: NexusStudioPersistedCampaignHandoff[];
}

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const canAccessNexusStudioCampaignHandoffHistory = (
  role: NexusServiceSessionProfile['role']
): boolean =>
  getNexusStudioActionBoundary('studio.campaign.handoff.create').allowedRoles.includes(role);

export const persistNexusStudioCampaignHandoff = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusStudioActionInput
): Promise<NexusStudioPersistenceWriteResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (!canAccessNexusStudioCampaignHandoffHistory(authContext.role)) {
    return {
      persisted: false,
      reason: 'role_not_allowed',
    };
  }

  if (!isNexusStudioActionId(input.actionId) || !isPlausibleNexusStudioCampaignHandoff(input)) {
    return {
      persisted: false,
      reason: 'scope_not_allowed',
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      persisted: false,
      reason: 'database_not_configured',
    };
  }

  try {
    await ensureDatabaseReady();

    const recordId = randomUUID();
    await getDb().insert(nexusStudioCampaignHandoffsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      campaignGoal: input.campaignGoal,
      format: input.format,
      modality: input.modality,
      theme: input.theme,
      voice: input.voice,
      checklistTotal: input.checklistTotal,
      checklistComplete: input.checklistComplete,
      assetFormatCount: input.assetFormatCount,
      qrEnabled: input.qrEnabled,
      logoIncluded: input.logoIncluded,
      authorUserId: authContext.userId,
      authorPersonId: authContext.personId ?? null,
      authorEmail,
    });

    return {
      persisted: true,
      recordId,
    };
  } catch {
    return {
      persisted: false,
      reason: 'database_error',
    };
  }
};

export const listNexusStudioCampaignHandoffsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusStudioPersistedCampaignHandoffListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      campaignHandoffs: [],
    };
  }

  if (!canAccessNexusStudioCampaignHandoffHistory(authContext.role)) {
    return {
      status: 'role_not_allowed',
      campaignHandoffs: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      campaignHandoffs: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 30);
    const rows = await getDb()
      .select({
        id: nexusStudioCampaignHandoffsTable.id,
        campaignGoal: nexusStudioCampaignHandoffsTable.campaignGoal,
        format: nexusStudioCampaignHandoffsTable.format,
        modality: nexusStudioCampaignHandoffsTable.modality,
        theme: nexusStudioCampaignHandoffsTable.theme,
        voice: nexusStudioCampaignHandoffsTable.voice,
        checklistTotal: nexusStudioCampaignHandoffsTable.checklistTotal,
        checklistComplete: nexusStudioCampaignHandoffsTable.checklistComplete,
        assetFormatCount: nexusStudioCampaignHandoffsTable.assetFormatCount,
        qrEnabled: nexusStudioCampaignHandoffsTable.qrEnabled,
        logoIncluded: nexusStudioCampaignHandoffsTable.logoIncluded,
        createdAt: nexusStudioCampaignHandoffsTable.createdAt,
      })
      .from(nexusStudioCampaignHandoffsTable)
      .where(eq(nexusStudioCampaignHandoffsTable.organizationId, authContext.organizationId))
      .orderBy(desc(nexusStudioCampaignHandoffsTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      campaignHandoffs: rows.flatMap((row) =>
        isPlausibleNexusStudioCampaignHandoff(row)
          ? [
              {
                id: row.id,
                campaignGoal: row.campaignGoal,
                format: row.format,
                modality: row.modality,
                theme: row.theme,
                voice: row.voice,
                checklistTotal: row.checklistTotal,
                checklistComplete: row.checklistComplete,
                assetFormatCount: row.assetFormatCount,
                qrEnabled: row.qrEnabled,
                logoIncluded: row.logoIncluded,
                createdAtLabel: formatNexusPersistedDateLabel(row.createdAt),
                source: 'authenticated' as const,
              },
            ]
          : []
      ),
    };
  } catch {
    return {
      status: 'database_error',
      campaignHandoffs: [],
    };
  }
};
