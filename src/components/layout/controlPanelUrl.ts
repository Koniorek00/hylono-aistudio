const LOCAL_CONTROL_PANEL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
]);

type ResolvePublicControlPanelUrlOptions = {
  environment?: string;
  allowDevelopmentLocalLink?: boolean;
};

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/^\[(.*)\]$/, '$1');
}

function isLocalControlPanelHost(hostname: string) {
  const normalizedHostname = normalizeHostname(hostname);

  return (
    LOCAL_CONTROL_PANEL_HOSTS.has(normalizedHostname) ||
    normalizedHostname.startsWith('127.') ||
    normalizedHostname.endsWith('.local')
  );
}

export function resolvePublicControlPanelUrl(
  rawUrl: string | null | undefined,
  options: ResolvePublicControlPanelUrlOptions = {}
) {
  const trimmedUrl = rawUrl?.trim();

  if (!trimmedUrl) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(trimmedUrl);
  } catch {
    return null;
  }

  const isDevelopment = options.environment === 'development';

  if (!isDevelopment || !options.allowDevelopmentLocalLink) {
    return null;
  }

  if (!isLocalControlPanelHost(url.hostname)) {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return null;
  }

  return url.toString();
}
