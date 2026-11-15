interface VercelTelemetryOptions {
  override?: string;
  vercel?: string;
}

export const isVercelTelemetryEnabled = ({
  override = process.env.NEXT_PUBLIC_ENABLE_VERCEL_TELEMETRY,
  vercel = process.env.VERCEL,
}: VercelTelemetryOptions = {}): boolean => {
  if (override === 'false') {
    return false;
  }

  return vercel === '1' || override === 'true';
};
