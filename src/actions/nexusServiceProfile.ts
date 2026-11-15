import { and, desc, eq, or, sql } from 'drizzle-orm';
import { isNexusServiceRole } from '@/content/nexus-service-app-contract';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { nexusServiceProfilesTable } from '@/lib/db/schema';
import type {
  NexusServiceSessionLike,
  NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusServiceProfileStatus = 'active' | 'pending' | 'disabled';

export interface NexusServiceStoredProfileRecord {
  userId?: string | null;
  email?: string | null;
  organizationId?: string | null;
  personId?: string | null;
  ownerDeviceIds?: unknown;
  role?: string | null;
  status?: string | null;
}

export type NexusServiceOwnerDeviceScopeListStatus =
  | 'loaded'
  | 'database_error'
  | 'database_not_configured'
  | 'auth_context_missing'
  | 'role_not_allowed';

export interface NexusServiceOwnerDeviceScopeItem {
  id: string;
  ownerLabel: string;
  personId?: string;
  ownerDeviceIds: string[];
  status: NexusServiceProfileStatus;
  updatedAt: string;
  source: 'authenticated';
}

export interface NexusServiceOwnerDeviceScopeListResult {
  status: NexusServiceOwnerDeviceScopeListStatus;
  ownerDeviceScopes: NexusServiceOwnerDeviceScopeItem[];
}

const normalizeEmail = (email?: string | null): string | null => {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
};

const normalizeId = (value?: string | null): string | null => {
  const normalized = value?.trim();
  return normalized || null;
};

const normalizeOwnerDeviceIds = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = Array.from(
    new Set(
      value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    )
  );

  return normalized.length > 0 ? normalized : undefined;
};

const formatUpdatedAt = (updatedAt: Date | string | null): string => {
  if (!updatedAt) {
    return 'Profile storage';
  }

  const parsed = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

  if (Number.isNaN(parsed.getTime())) {
    return 'Profile storage';
  }

  return `Updated ${parsed.toISOString().slice(0, 16).replace('T', ' ')}`;
};

export const normalizeNexusServiceSessionProfile = (
  session: NexusServiceSessionLike | null,
  record: NexusServiceStoredProfileRecord | null
): NexusServiceSessionProfile | null => {
  const sessionEmail = normalizeEmail(session?.user?.email);
  const sessionUserId = normalizeId(session?.user?.id);
  const recordEmail = normalizeEmail(record?.email);
  const recordUserId = normalizeId(record?.userId);
  const organizationId = normalizeId(record?.organizationId);
  const personId = normalizeId(record?.personId);
  const ownerDeviceIds = normalizeOwnerDeviceIds(record?.ownerDeviceIds);
  const role = normalizeId(record?.role);
  const status = normalizeId(record?.status) as NexusServiceProfileStatus | null;

  if (!sessionEmail || !recordEmail || recordEmail !== sessionEmail) {
    return null;
  }

  if (recordUserId && sessionUserId && recordUserId !== sessionUserId) {
    return null;
  }

  if (!organizationId || !role || !isNexusServiceRole(role)) {
    return null;
  }

  if (status !== 'active') {
    return null;
  }

  const normalizedProfile: NexusServiceSessionProfile = {
    role,
    organizationId,
  };

  if (personId) {
    normalizedProfile.personId = personId;
  }

  if (ownerDeviceIds) {
    normalizedProfile.ownerDeviceIds = ownerDeviceIds;
  }

  return normalizedProfile;
};

export const getNexusServiceSessionProfileFromRecords = (
  session: NexusServiceSessionLike | null,
  records: readonly NexusServiceStoredProfileRecord[]
): NexusServiceSessionProfile | null => {
  const sessionUserId = normalizeId(session?.user?.id);
  const exactUserIdRecords = sessionUserId
    ? records.filter(
        (record) => normalizeId(record.userId) === sessionUserId
      )
    : [];
  const fallbackRecords = records.filter(
    (record) => normalizeId(record.userId) === null
  );
  const candidateRecords =
    exactUserIdRecords.length > 0 ? exactUserIdRecords : fallbackRecords;

  for (const record of candidateRecords) {
    const profile = normalizeNexusServiceSessionProfile(session, record);
    if (profile) {
      return profile;
    }
  }

  return null;
};

export const getNexusServiceSessionProfile = async (
  session: NexusServiceSessionLike | null
): Promise<NexusServiceSessionProfile | null> => {
  const email = normalizeEmail(session?.user?.email);
  const userId = normalizeId(session?.user?.id);

  if (!email || !isDatabaseConfigured()) {
    return null;
  }

  await ensureDatabaseReady();

  const matches = userId
    ? or(
        eq(nexusServiceProfilesTable.userId, userId),
        sql`lower(${nexusServiceProfilesTable.email}) = ${email}`
      )
    : sql`lower(${nexusServiceProfilesTable.email}) = ${email}`;

  const rows = await getDb()
    .select({
      userId: nexusServiceProfilesTable.userId,
      email: nexusServiceProfilesTable.email,
      organizationId: nexusServiceProfilesTable.organizationId,
      personId: nexusServiceProfilesTable.personId,
      ownerDeviceIds: nexusServiceProfilesTable.ownerDeviceIds,
      role: nexusServiceProfilesTable.role,
      status: nexusServiceProfilesTable.status,
    })
    .from(nexusServiceProfilesTable)
    .where(matches)
    .orderBy(desc(nexusServiceProfilesTable.updatedAt))
    .limit(5);

  return getNexusServiceSessionProfileFromRecords(session, rows);
};

export const listNexusServiceOwnerDeviceScopesForSession = async (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  limit = 25
): Promise<NexusServiceOwnerDeviceScopeListResult> => {
  const email = normalizeEmail(session?.user?.email);

  if (!email || !profile?.organizationId) {
    return {
      status: 'auth_context_missing',
      ownerDeviceScopes: [],
    };
  }

  if (profile.role !== 'SERVICE_MANAGER' && profile.role !== 'OPERATIONS_ADMIN') {
    return {
      status: 'role_not_allowed',
      ownerDeviceScopes: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: 'database_not_configured',
      ownerDeviceScopes: [],
    };
  }

  try {
    await ensureDatabaseReady();

    const boundedLimit = Math.min(Math.max(limit, 1), 50);
    const rows = await getDb()
      .select({
        id: nexusServiceProfilesTable.id,
        email: nexusServiceProfilesTable.email,
        organizationId: nexusServiceProfilesTable.organizationId,
        personId: nexusServiceProfilesTable.personId,
        ownerDeviceIds: nexusServiceProfilesTable.ownerDeviceIds,
        role: nexusServiceProfilesTable.role,
        status: nexusServiceProfilesTable.status,
        updatedAt: nexusServiceProfilesTable.updatedAt,
      })
      .from(nexusServiceProfilesTable)
      .where(
        and(
          eq(nexusServiceProfilesTable.organizationId, profile.organizationId),
          eq(nexusServiceProfilesTable.role, 'OWNER'),
          eq(nexusServiceProfilesTable.status, 'active')
        )
      )
      .orderBy(desc(nexusServiceProfilesTable.updatedAt))
      .limit(boundedLimit);

    return {
      status: 'loaded',
      ownerDeviceScopes: rows.map((row) => ({
        id: row.id,
        ownerLabel: row.personId || row.email,
        ...(row.personId ? { personId: row.personId } : {}),
        ownerDeviceIds: normalizeOwnerDeviceIds(row.ownerDeviceIds) ?? [],
        status: row.status as NexusServiceProfileStatus,
        updatedAt: formatUpdatedAt(row.updatedAt),
        source: 'authenticated',
      })),
    };
  } catch {
    return {
      status: 'database_error',
      ownerDeviceScopes: [],
    };
  }
};
