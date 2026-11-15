'use server';

import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import {
  getNexusSuppliesActionBoundary,
  isNexusSuppliesActionId,
  type NexusSuppliesActionInput,
} from '@/content/nexus-supplies-persistence-contract';
import { isPlausibleNexusSuppliesRequisitionAggregate } from '@/content/nexus-supplies-operations';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { nexusSupplyRequisitionsTable } from '@/lib/db/schema';
import { formatNexusPersistedDateLabel } from '@/src/actions/nexusPersistenceLabels';
import type { NexusSuppliesPersistedRequisition } from '@/src/actions/nexusSuppliesActionCore';
import {
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusSuppliesPersistenceWriteResult =
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

export type NexusSuppliesPersistedRequisitionListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing'
  | 'role_not_allowed';

export interface NexusSuppliesPersistedRequisitionListResult {
  status: NexusSuppliesPersistedRequisitionListStatus;
  requisitions: NexusSuppliesPersistedRequisition[];
}

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const canAccessNexusSuppliesRequisitionHistory = (
  role: NexusServiceSessionProfile['role']
): boolean =>
  getNexusSuppliesActionBoundary('supplies.requisition.create').allowedRoles.includes(role);

export const persistNexusSuppliesRequisition = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusSuppliesActionInput
): Promise<NexusSuppliesPersistenceWriteResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (!canAccessNexusSuppliesRequisitionHistory(authContext.role)) {
    return {
      persisted: false,
      reason: 'role_not_allowed',
    };
  }

  if (
    !isNexusSuppliesActionId(input.actionId) ||
    !isPlausibleNexusSuppliesRequisitionAggregate(input)
  ) {
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
    await getDb().insert(nexusSupplyRequisitionsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      lineCount: input.lineCount,
      totalPacks: input.totalPacks,
      approvalOnlyLines: input.approvalOnlyLines,
      status: input.nextStatus,
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

export const listNexusSuppliesRequisitionsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusSuppliesPersistedRequisitionListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      requisitions: [],
    };
  }

  if (!canAccessNexusSuppliesRequisitionHistory(authContext.role)) {
    return {
      status: 'role_not_allowed',
      requisitions: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      requisitions: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 30);
    const rows = await getDb()
      .select({
        id: nexusSupplyRequisitionsTable.id,
        lineCount: nexusSupplyRequisitionsTable.lineCount,
        totalPacks: nexusSupplyRequisitionsTable.totalPacks,
        approvalOnlyLines: nexusSupplyRequisitionsTable.approvalOnlyLines,
        status: nexusSupplyRequisitionsTable.status,
        createdAt: nexusSupplyRequisitionsTable.createdAt,
      })
      .from(nexusSupplyRequisitionsTable)
      .where(eq(nexusSupplyRequisitionsTable.organizationId, authContext.organizationId))
      .orderBy(desc(nexusSupplyRequisitionsTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      requisitions: rows.flatMap((row) =>
        isPlausibleNexusSuppliesRequisitionAggregate({
          lineCount: row.lineCount,
          totalPacks: row.totalPacks,
          approvalOnlyLines: row.approvalOnlyLines,
          nextStatus: row.status,
        })
          ? [
              {
                id: row.id,
                lineCount: row.lineCount,
                totalPacks: row.totalPacks,
                approvalOnlyLines: row.approvalOnlyLines,
                status: row.status,
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
      requisitions: [],
    };
  }
};
