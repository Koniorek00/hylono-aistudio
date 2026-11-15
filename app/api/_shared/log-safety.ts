import { createHash } from 'node:crypto';

const REDACTED = '[redacted]';
const SENSITIVE_FIELD_PATTERN =
  /(^ip$|address|authorization|body|client.?id|client.?ip|client.?secret|email|first.?name|from|full.?name|ip.?address|last.?name|message|name|notes?|password|payload|phone|reply.?to|secret|stripe|subject|text|token|to|user.?agent)/i;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Error);

export const hashIdentifierForLog = (value: string): string =>
  createHash('sha256').update(value.trim().toLowerCase()).digest('hex').slice(0, 12);

export const summarizeErrorForOperationalLog = (
  error: unknown
): Record<string, string> => {
  if (error instanceof Error) {
    return { name: error.name };
  }

  return { name: typeof error };
};

export const summarizeProviderResponseBody = (
  responseBody: string
): { redacted: true; bytes: number } => ({
  redacted: true,
  bytes: Buffer.byteLength(responseBody, 'utf8'),
});

export const formatMissingDatabaseConfigurationLogMessage = (
  area: string
): string => `[${area}] Database persistence configuration missing`;

export const redactForOperationalLog = (value: unknown): unknown => {
  if (value instanceof Error) {
    return summarizeErrorForOperationalLog(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactForOperationalLog(item));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_FIELD_PATTERN.test(key) ? REDACTED : redactForOperationalLog(entry),
    ])
  );
};
