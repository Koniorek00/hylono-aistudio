export const LANDING_ACQUISITION_EVENT = 'landing_acquisition_detected';
export const LANDING_ACQUISITION_SESSION_KEY = 'hylonoLandingAcquisitionDetected:v1';

export type AcquisitionChannel =
  | 'google_search'
  | 'google_ai_overview'
  | 'bing_search'
  | 'copilot'
  | 'chatgpt'
  | 'perplexity'
  | 'claude'
  | 'gemini'
  | 'youcom'
  | 'direct'
  | 'other';

export type AcquisitionMedium =
  | 'organic_search'
  | 'ai_assistant'
  | 'ai_search'
  | 'referral'
  | 'direct'
  | 'paid'
  | 'unknown';

export interface LandingAcquisition {
  channel: AcquisitionChannel;
  source: string;
  medium: AcquisitionMedium;
  referrerHost: string | null;
  landingPath: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  isAiAssistant: boolean;
  isSearch: boolean;
}

const AI_CHANNELS = new Set<AcquisitionChannel>([
  'google_ai_overview',
  'copilot',
  'chatgpt',
  'perplexity',
  'claude',
  'gemini',
  'youcom',
]);

const normalizeToken = (value: string | null): string | null => {
  if (!value) return null;
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || null;
};

const getUrl = (value: string | URL): URL => (value instanceof URL ? value : new URL(value));

const parseReferrerHost = (referrer: string | null | undefined): string | null => {
  if (!referrer) return null;

  try {
    return new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
};

const channelFromToken = (token: string | null): AcquisitionChannel | null => {
  if (!token) return null;

  if (['chatgpt', 'openai', 'oai_searchbot'].includes(token)) return 'chatgpt';
  if (['perplexity', 'perplexity_ai'].includes(token)) return 'perplexity';
  if (['copilot', 'bing_copilot', 'microsoft_copilot'].includes(token)) return 'copilot';
  if (['google_ai_overview', 'google_aio', 'google_ai_mode', 'ai_overview'].includes(token)) {
    return 'google_ai_overview';
  }
  if (['claude', 'anthropic'].includes(token)) return 'claude';
  if (['gemini', 'bard'].includes(token)) return 'gemini';
  if (['you', 'you_com', 'youai'].includes(token)) return 'youcom';
  if (['google', 'google_search'].includes(token)) return 'google_search';
  if (['bing', 'bing_search'].includes(token)) return 'bing_search';

  return null;
};

const channelFromHost = (host: string | null): AcquisitionChannel | null => {
  if (!host) return null;

  if (host === 'chatgpt.com' || host === 'openai.com' || host.endsWith('.openai.com')) return 'chatgpt';
  if (host.endsWith('perplexity.ai')) return 'perplexity';
  if (host === 'copilot.microsoft.com') return 'copilot';
  if (host === 'claude.ai' || host.endsWith('anthropic.com')) return 'claude';
  if (host === 'gemini.google.com' || host === 'bard.google.com') return 'gemini';
  if (host === 'you.com') return 'youcom';
  if (host === 'bing.com' || host.endsWith('.bing.com')) return 'bing_search';
  if (host === 'google.com' || host.endsWith('.google.com') || /^google\.[a-z.]+$/.test(host)) {
    return 'google_search';
  }

  return null;
};

const mediumFor = (channel: AcquisitionChannel, utmMedium: string | null): AcquisitionMedium => {
  const normalizedMedium = normalizeToken(utmMedium);

  if (normalizedMedium && ['cpc', 'paid', 'ppc', 'paid_search', 'paid_social'].includes(normalizedMedium)) {
    return 'paid';
  }

  if (channel === 'direct') return 'direct';
  if (channel === 'google_ai_overview' || channel === 'copilot') return 'ai_search';
  if (AI_CHANNELS.has(channel)) return 'ai_assistant';
  if (channel === 'google_search' || channel === 'bing_search') return 'organic_search';

  return normalizedMedium === 'referral' ? 'referral' : 'unknown';
};

export const detectLandingAcquisition = (
  landingUrl: string | URL,
  referrer?: string | null
): LandingAcquisition => {
  const url = getUrl(landingUrl);
  const utmSource = normalizeToken(url.searchParams.get('utm_source'));
  const utmMedium = normalizeToken(url.searchParams.get('utm_medium'));
  const utmCampaign = normalizeToken(url.searchParams.get('utm_campaign'));
  const referrerHost = parseReferrerHost(referrer);

  const channel =
    channelFromToken(utmSource) ?? channelFromHost(referrerHost) ?? (referrerHost ? 'other' : 'direct');
  const source = utmSource ?? referrerHost ?? 'direct';
  const medium = mediumFor(channel, utmMedium);

  return {
    channel,
    source,
    medium,
    referrerHost,
    landingPath: `${url.pathname}${url.search}`,
    utmSource,
    utmMedium,
    utmCampaign,
    isAiAssistant: AI_CHANNELS.has(channel),
    isSearch: channel === 'google_search' || channel === 'bing_search' || medium === 'ai_search',
  };
};
