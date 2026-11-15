import { z } from 'zod';

export interface CustomerSessionLike {
  user?: {
    id?: string | null;
    email?: string | null;
    name?: string | null;
  } | null;
}

export interface CustomerIdentityInput {
  session: CustomerSessionLike | null | undefined;
  requestedOwnerId?: unknown;
}

export interface AuthenticatedCustomerIdentity {
  ownerId: string;
  email: string;
  name: string | null;
}

export type CustomerIdentityResult =
  | {
      ok: true;
      identity: AuthenticatedCustomerIdentity;
    }
  | {
      ok: false;
      reason:
        | 'auth_required'
        | 'invalid_identity'
        | 'client_owner_id_rejected';
    };

const emailSchema = z.string().email().max(254);

const normalizeSessionEmail = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return emailSchema.safeParse(normalized).success ? normalized : null;
};

const normalizeSessionOwnerId = (value: unknown, email: string): string => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return email;
};

const normalizeSessionName = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
};

export const resolveCustomerIdentity = ({
  session,
  requestedOwnerId,
}: CustomerIdentityInput): CustomerIdentityResult => {
  if (requestedOwnerId !== undefined && requestedOwnerId !== null) {
    return {
      ok: false,
      reason: 'client_owner_id_rejected',
    };
  }

  const rawEmail = session?.user?.email;

  if (typeof rawEmail !== 'string' || rawEmail.trim() === '') {
    return {
      ok: false,
      reason: 'auth_required',
    };
  }

  const email = normalizeSessionEmail(rawEmail);

  if (!email) {
    return {
      ok: false,
      reason: 'invalid_identity',
    };
  }

  return {
    ok: true,
    identity: {
      ownerId: normalizeSessionOwnerId(session?.user?.id, email),
      email,
      name: normalizeSessionName(session?.user?.name),
    },
  };
};
