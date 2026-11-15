'use server';

import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import {
  getNexusClientsActionBoundary,
  isNexusClientsActionId,
  isPlausibleNexusClientsIntakeDraft,
  type NexusClientsActionInput,
} from '@/content/nexus-clients-persistence-contract';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { nexusClientIntakeDraftsTable } from '@/lib/db/schema';
import type { NexusClientsPersistedIntakeDraft } from '@/src/actions/nexusClientsActionCore';
import { formatNexusPersistedDateLabel } from '@/src/actions/nexusPersistenceLabels';
import {
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusClientsPersistenceWriteResult =
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

export type NexusClientsPersistedIntakeDraftListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing'
  | 'role_not_allowed';

export interface NexusClientsPersistedIntakeDraftListResult {
  status: NexusClientsPersistedIntakeDraftListStatus;
  intakeDrafts: NexusClientsPersistedIntakeDraft[];
}

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const canAccessNexusClientsIntakeDraftHistory = (
  role: NexusServiceSessionProfile['role']
): boolean =>
  getNexusClientsActionBoundary('clients.intake.draft.create').allowedRoles.includes(role);

export const persistNexusClientsIntakeDraft = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusClientsActionInput
): Promise<NexusClientsPersistenceWriteResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (!canAccessNexusClientsIntakeDraftHistory(authContext.role)) {
    return {
      persisted: false,
      reason: 'role_not_allowed',
    };
  }

  if (!isNexusClientsActionId(input.actionId) || !isPlausibleNexusClientsIntakeDraft(input)) {
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
    await getDb().insert(nexusClientIntakeDraftsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      risk: input.risk,
      identityFieldCount: input.identityFieldCount,
      protocolProvided: input.protocolProvided,
      dobProvided: input.dobProvided,
      nextSessionProvided: input.nextSessionProvided,
      previewOnly: input.previewOnly,
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

export const listNexusClientsIntakeDraftsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusClientsPersistedIntakeDraftListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      intakeDrafts: [],
    };
  }

  if (!canAccessNexusClientsIntakeDraftHistory(authContext.role)) {
    return {
      status: 'role_not_allowed',
      intakeDrafts: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      intakeDrafts: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 30);
    const rows = await getDb()
      .select({
        id: nexusClientIntakeDraftsTable.id,
        risk: nexusClientIntakeDraftsTable.risk,
        identityFieldCount: nexusClientIntakeDraftsTable.identityFieldCount,
        protocolProvided: nexusClientIntakeDraftsTable.protocolProvided,
        dobProvided: nexusClientIntakeDraftsTable.dobProvided,
        nextSessionProvided: nexusClientIntakeDraftsTable.nextSessionProvided,
        previewOnly: nexusClientIntakeDraftsTable.previewOnly,
        createdAt: nexusClientIntakeDraftsTable.createdAt,
      })
      .from(nexusClientIntakeDraftsTable)
      .where(eq(nexusClientIntakeDraftsTable.organizationId, authContext.organizationId))
      .orderBy(desc(nexusClientIntakeDraftsTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      intakeDrafts: rows.flatMap((row) =>
        isPlausibleNexusClientsIntakeDraft(row)
          ? [
              {
                id: row.id,
                risk: row.risk,
                identityFieldCount: row.identityFieldCount,
                protocolProvided: row.protocolProvided,
                dobProvided: row.dobProvided,
                nextSessionProvided: row.nextSessionProvided,
                previewOnly: row.previewOnly,
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
      intakeDrafts: [],
    };
  }
};
