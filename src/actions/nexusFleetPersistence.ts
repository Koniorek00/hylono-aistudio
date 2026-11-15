'use server';

import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import {
  getNexusFleetActionBoundary,
  isNexusFleetActionId,
  isPlausibleNexusFleetServiceLog,
  type NexusFleetActionInput,
} from '@/content/nexus-fleet-persistence-contract';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { nexusFleetServiceLogsTable } from '@/lib/db/schema';
import type { NexusFleetPersistedServiceLog } from '@/src/actions/nexusFleetActionCore';
import {
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusFleetPersistenceWriteResult =
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

export type NexusFleetPersistedLogListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing'
  | 'role_not_allowed';

export interface NexusFleetPersistedLogListResult {
  status: NexusFleetPersistedLogListStatus;
  logs: NexusFleetPersistedServiceLog[];
}

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const canAccessNexusFleetServiceLogHistory = (
  role: NexusServiceSessionProfile['role']
): boolean =>
  getNexusFleetActionBoundary('fleet.log.create').allowedRoles.includes(role);

export const persistNexusFleetServiceLog = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusFleetActionInput
): Promise<NexusFleetPersistenceWriteResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (!canAccessNexusFleetServiceLogHistory(authContext.role)) {
    return {
      persisted: false,
      reason: 'role_not_allowed',
    };
  }

  if (!isNexusFleetActionId(input.actionId) || !isPlausibleNexusFleetServiceLog(input)) {
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
    await getDb().insert(nexusFleetServiceLogsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      deviceId: input.deviceId,
      type: input.type,
      serviceDate: input.date,
      description: input.description,
      technician: input.technician,
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

export const listNexusFleetServiceLogsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 30
): Promise<NexusFleetPersistedLogListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      logs: [],
    };
  }

  if (!canAccessNexusFleetServiceLogHistory(authContext.role)) {
    return {
      status: 'role_not_allowed',
      logs: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      logs: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 60);
    const rows = await getDb()
      .select({
        id: nexusFleetServiceLogsTable.id,
        deviceId: nexusFleetServiceLogsTable.deviceId,
        type: nexusFleetServiceLogsTable.type,
        serviceDate: nexusFleetServiceLogsTable.serviceDate,
        description: nexusFleetServiceLogsTable.description,
        technician: nexusFleetServiceLogsTable.technician,
      })
      .from(nexusFleetServiceLogsTable)
      .where(eq(nexusFleetServiceLogsTable.organizationId, authContext.organizationId))
      .orderBy(desc(nexusFleetServiceLogsTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      logs: rows.flatMap((row) => {
        const candidate = {
          deviceId: row.deviceId as NexusFleetActionInput['deviceId'],
          date: row.serviceDate,
          type: row.type as NexusFleetActionInput['type'],
          description: row.description,
          technician: row.technician,
        };

        return isPlausibleNexusFleetServiceLog(candidate)
          ? [
              {
                id: row.id,
                deviceId: candidate.deviceId,
                type: candidate.type,
                date: row.serviceDate,
                description: row.description,
                technician: row.technician,
                source: 'authenticated' as const,
              },
            ]
          : [];
      }),
    };
  } catch {
    return {
      status: 'database_error',
      logs: [],
    };
  }
};
