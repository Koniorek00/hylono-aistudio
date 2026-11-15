'use server';

import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import {
  getNexusTeamActionBoundary,
  isNexusTeamActionId,
  isPlausibleNexusTeamHandoff,
  type NexusTeamActionInput,
} from '@/content/nexus-team-persistence-contract';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { nexusTeamHandoffsTable } from '@/lib/db/schema';
import { formatNexusPersistedDateLabel } from '@/src/actions/nexusPersistenceLabels';
import type { NexusTeamPersistedHandoff } from '@/src/actions/nexusTeamActionCore';
import {
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusTeamPersistenceWriteResult =
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

export type NexusTeamPersistedHandoffListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing'
  | 'role_not_allowed';

export interface NexusTeamPersistedHandoffListResult {
  status: NexusTeamPersistedHandoffListStatus;
  handoffs: NexusTeamPersistedHandoff[];
}

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const canAccessNexusTeamHandoffHistory = (
  role: NexusServiceSessionProfile['role']
): boolean =>
  getNexusTeamActionBoundary('team.handoff.create').allowedRoles.includes(role);

export const persistNexusTeamHandoff = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusTeamActionInput
): Promise<NexusTeamPersistenceWriteResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (!canAccessNexusTeamHandoffHistory(authContext.role)) {
    return {
      persisted: false,
      reason: 'role_not_allowed',
    };
  }

  if (!isNexusTeamActionId(input.actionId) || !isPlausibleNexusTeamHandoff(input)) {
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
    await getDb().insert(nexusTeamHandoffsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      moduleName: input.moduleName,
      targetAudience: input.targetAudience,
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

export const listNexusTeamHandoffsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusTeamPersistedHandoffListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      handoffs: [],
    };
  }

  if (!canAccessNexusTeamHandoffHistory(authContext.role)) {
    return {
      status: 'role_not_allowed',
      handoffs: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      handoffs: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 30);
    const rows = await getDb()
      .select({
        id: nexusTeamHandoffsTable.id,
        moduleName: nexusTeamHandoffsTable.moduleName,
        targetAudience: nexusTeamHandoffsTable.targetAudience,
        createdAt: nexusTeamHandoffsTable.createdAt,
      })
      .from(nexusTeamHandoffsTable)
      .where(eq(nexusTeamHandoffsTable.organizationId, authContext.organizationId))
      .orderBy(desc(nexusTeamHandoffsTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      handoffs: rows.flatMap((row) =>
        isPlausibleNexusTeamHandoff(row)
          ? [
              {
                id: row.id,
                moduleName: row.moduleName,
                targetAudience: row.targetAudience,
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
      handoffs: [],
    };
  }
};
