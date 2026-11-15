'use server';

import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import {
  getNexusAcademyActionBoundary,
  isNexusAcademyActionId,
  isPlausibleNexusAcademyAssignment,
  type NexusAcademyActionInput,
} from '@/content/nexus-academy-persistence-contract';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { nexusAcademyAssignmentsTable } from '@/lib/db/schema';
import type { NexusAcademyPersistedAssignment } from '@/src/actions/nexusAcademyActionCore';
import { formatNexusPersistedDateLabel } from '@/src/actions/nexusPersistenceLabels';
import {
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusAcademyPersistenceWriteResult =
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

export type NexusAcademyPersistedAssignmentListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing'
  | 'role_not_allowed';

export interface NexusAcademyPersistedAssignmentListResult {
  status: NexusAcademyPersistedAssignmentListStatus;
  assignments: NexusAcademyPersistedAssignment[];
}

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const canAccessNexusAcademyAssignmentHistory = (
  role: NexusServiceSessionProfile['role']
): boolean =>
  getNexusAcademyActionBoundary('academy.assignment.create').allowedRoles.includes(role);

export const persistNexusAcademyAssignment = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusAcademyActionInput
): Promise<NexusAcademyPersistenceWriteResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (!canAccessNexusAcademyAssignmentHistory(authContext.role)) {
    return {
      persisted: false,
      reason: 'role_not_allowed',
    };
  }

  if (!isNexusAcademyActionId(input.actionId) || !isPlausibleNexusAcademyAssignment(input)) {
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
    await getDb().insert(nexusAcademyAssignmentsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      roleTrack: input.roleTrack,
      moduleCount: input.moduleCount,
      requiredCount: input.requiredCount,
      drillIncluded: input.drillIncluded,
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

export const listNexusAcademyAssignmentsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusAcademyPersistedAssignmentListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      assignments: [],
    };
  }

  if (!canAccessNexusAcademyAssignmentHistory(authContext.role)) {
    return {
      status: 'role_not_allowed',
      assignments: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      assignments: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 30);
    const rows = await getDb()
      .select({
        id: nexusAcademyAssignmentsTable.id,
        roleTrack: nexusAcademyAssignmentsTable.roleTrack,
        moduleCount: nexusAcademyAssignmentsTable.moduleCount,
        requiredCount: nexusAcademyAssignmentsTable.requiredCount,
        drillIncluded: nexusAcademyAssignmentsTable.drillIncluded,
        createdAt: nexusAcademyAssignmentsTable.createdAt,
      })
      .from(nexusAcademyAssignmentsTable)
      .where(eq(nexusAcademyAssignmentsTable.organizationId, authContext.organizationId))
      .orderBy(desc(nexusAcademyAssignmentsTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      assignments: rows.flatMap((row) =>
        isPlausibleNexusAcademyAssignment(row)
          ? [
              {
                id: row.id,
                roleTrack: row.roleTrack,
                moduleCount: row.moduleCount,
                requiredCount: row.requiredCount,
                drillIncluded: row.drillIncluded,
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
      assignments: [],
    };
  }
};
