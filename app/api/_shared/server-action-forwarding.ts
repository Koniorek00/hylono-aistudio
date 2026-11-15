import { createHmac, timingSafeEqual } from 'node:crypto';
import { readRuntimeEnv } from '@/lib/env';

const SERVER_ACTION_CLIENT_ID_HEADER = 'x-hylono-action-client-id';
const SERVER_ACTION_TIMESTAMP_HEADER = 'x-hylono-action-timestamp';
const SERVER_ACTION_SIGNATURE_HEADER = 'x-hylono-action-signature';
const SERVER_ACTION_SIGNATURE_TTL_MS = 5 * 60 * 1000;

type HeaderReader = {
  get(name: string): string | null;
};

const resolveForwardingSecret = (): string | undefined =>
  readRuntimeEnv('INTAKE_FORWARDING_SECRET') ??
  readRuntimeEnv('NEXTAUTH_SECRET') ??
  readRuntimeEnv('AUTH_SECRET');

const normalizeHeaderValue = (value: string | null): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const resolveRawClientId = (headers: HeaderReader): string | null => {
  return (
    normalizeHeaderValue(headers.get('cf-connecting-ip')) ??
    normalizeHeaderValue(headers.get('x-real-ip'))
  );
};

const signForwardedClientId = (
  clientId: string,
  timestamp: string,
  secret: string
): string =>
  createHmac('sha256', secret)
    .update(`${timestamp}.${clientId}`)
    .digest('hex');

const safeEqualHex = (actual: string, expected: string): boolean => {
  try {
    const actualBuffer = Buffer.from(actual, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');

    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    );
  } catch {
    return false;
  }
};

export const createServerActionForwardingHeaders = (
  sourceHeaders: HeaderReader,
  now = Date.now()
): Record<string, string> => {
  const secret = resolveForwardingSecret();
  const rawClientId = resolveRawClientId(sourceHeaders);

  if (!secret || !rawClientId) {
    return {};
  }

  const timestamp = String(now);
  const clientId = createHmac('sha256', secret)
    .update(rawClientId)
    .digest('hex');

  return {
    [SERVER_ACTION_CLIENT_ID_HEADER]: `server-action:${clientId}`,
    [SERVER_ACTION_TIMESTAMP_HEADER]: timestamp,
    [SERVER_ACTION_SIGNATURE_HEADER]: signForwardedClientId(
      `server-action:${clientId}`,
      timestamp,
      secret
    ),
  };
};

export const verifyServerActionForwardedClientId = (
  headers: HeaderReader,
  now = Date.now()
): string | null => {
  const secret = resolveForwardingSecret();
  if (!secret) {
    return null;
  }

  const clientId = normalizeHeaderValue(headers.get(SERVER_ACTION_CLIENT_ID_HEADER));
  const timestamp = normalizeHeaderValue(headers.get(SERVER_ACTION_TIMESTAMP_HEADER));
  const signature = normalizeHeaderValue(headers.get(SERVER_ACTION_SIGNATURE_HEADER));

  if (!clientId || !timestamp || !signature) {
    return null;
  }

  const timestampNumber = Number(timestamp);
  if (
    !Number.isFinite(timestampNumber) ||
    Math.abs(now - timestampNumber) > SERVER_ACTION_SIGNATURE_TTL_MS
  ) {
    return null;
  }

  const expected = signForwardedClientId(clientId, timestamp, secret);
  return safeEqualHex(signature, expected) ? clientId : null;
};
