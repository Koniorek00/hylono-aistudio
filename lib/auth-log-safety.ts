import { createHash } from 'node:crypto';

export interface CredentialsAuthLogContext {
  emailHash: string;
  retryAfterSeconds?: number;
  conclusion?: string;
}

export const hashAuthIdentifierForLog = (value: string): string =>
  createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex')
    .slice(0, 12);

export const buildCredentialsAuthLogContext = (
  email: string,
  details: Omit<CredentialsAuthLogContext, 'emailHash'> = {}
): CredentialsAuthLogContext => ({
  emailHash: hashAuthIdentifierForLog(email),
  ...details,
});

export const buildSignInRateLimitKey = (ip: string, email: string): string =>
  `signin:${hashAuthIdentifierForLog(`${ip}:${email}`)}`;
