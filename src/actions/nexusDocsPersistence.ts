'use server';

import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import {
  getNexusDocsActionBoundary,
  isNexusDocsActionId,
  isPlausibleNexusDocsDocumentPacket,
  type NexusDocsActionInput,
} from '@/content/nexus-docs-persistence-contract';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { nexusDocumentPacketsTable } from '@/lib/db/schema';
import type { NexusDocsPersistedDocumentPacket } from '@/src/actions/nexusDocsActionCore';
import { formatNexusPersistedDateLabel } from '@/src/actions/nexusPersistenceLabels';
import {
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusDocsPersistenceWriteResult =
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

export type NexusDocsPersistedDocumentPacketListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing'
  | 'role_not_allowed';

export interface NexusDocsPersistedDocumentPacketListResult {
  status: NexusDocsPersistedDocumentPacketListStatus;
  documentPackets: NexusDocsPersistedDocumentPacket[];
}

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const canAccessNexusDocsDocumentPacketHistory = (
  role: NexusServiceSessionProfile['role']
): boolean =>
  getNexusDocsActionBoundary('docs.packet.prepare').allowedRoles.includes(role);

export const persistNexusDocsDocumentPacket = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusDocsActionInput
): Promise<NexusDocsPersistenceWriteResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);
  const authorEmail = normalizeEmail(session?.user?.email);

  if (!authContext || !authorEmail) {
    return {
      persisted: false,
      reason: 'auth_context_missing',
    };
  }

  if (!canAccessNexusDocsDocumentPacketHistory(authContext.role)) {
    return {
      persisted: false,
      reason: 'role_not_allowed',
    };
  }

  if (!isNexusDocsActionId(input.actionId) || !isPlausibleNexusDocsDocumentPacket(input)) {
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
    await getDb().insert(nexusDocumentPacketsTable).values({
      id: recordId,
      organizationId: authContext.organizationId,
      templateId: input.templateId,
      category: input.category,
      required: input.required,
      clientNamePresent: input.clientNamePresent,
      clinicNamePresent: input.clinicNamePresent,
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

export const listNexusDocsDocumentPacketsForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 10
): Promise<NexusDocsPersistedDocumentPacketListResult> => {
  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    return {
      status: 'auth_context_missing',
      documentPackets: [],
    };
  }

  if (!canAccessNexusDocsDocumentPacketHistory(authContext.role)) {
    return {
      status: 'role_not_allowed',
      documentPackets: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      documentPackets: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 30);
    const rows = await getDb()
      .select({
        id: nexusDocumentPacketsTable.id,
        templateId: nexusDocumentPacketsTable.templateId,
        category: nexusDocumentPacketsTable.category,
        required: nexusDocumentPacketsTable.required,
        clientNamePresent: nexusDocumentPacketsTable.clientNamePresent,
        clinicNamePresent: nexusDocumentPacketsTable.clinicNamePresent,
        createdAt: nexusDocumentPacketsTable.createdAt,
      })
      .from(nexusDocumentPacketsTable)
      .where(eq(nexusDocumentPacketsTable.organizationId, authContext.organizationId))
      .orderBy(desc(nexusDocumentPacketsTable.createdAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      documentPackets: rows.flatMap((row) =>
        isPlausibleNexusDocsDocumentPacket(row)
          ? [
              {
                id: row.id,
                templateId: row.templateId,
                category: row.category,
                required: row.required,
                clientNamePresent: row.clientNamePresent,
                clinicNamePresent: row.clinicNamePresent,
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
      documentPackets: [],
    };
  }
};
