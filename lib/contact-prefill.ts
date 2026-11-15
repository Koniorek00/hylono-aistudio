import { products } from '@/content/products';
import {
  parsePlannerSearchParams,
  plannerModalityLabels,
  plannerModalityToContactInterest,
  summarizePlannerSelection,
} from '@/lib/planner-state';

export type ContactIntentChoice = 'owner' | 'clinic' | 'curious' | 'rental';

export interface ContactPrefill {
  intent?: ContactIntentChoice;
  subject?: string;
  message?: string;
  interest?: string;
  clinicName?: string;
}

interface LocatorContactHrefInput {
  city?: string;
  country?: string;
  intent?: ContactIntentChoice;
  modality?: string;
  partnerName?: string;
  partnerType?: string;
}

interface PartnerContactHrefInput {
  intent?: ContactIntentChoice;
  partnerType?: string;
}

interface AffiliateContactHrefInput {
  intent?: ContactIntentChoice;
  channelType?: string;
}

interface LearningContactHrefInput {
  intent?: ContactIntentChoice;
}

interface MeridianContactHrefInput {
  intent?: ContactIntentChoice;
}

interface Product3DLabContactHrefInput {
  intent?: ContactIntentChoice;
}

interface SearchContactHrefInput {
  intent?: ContactIntentChoice;
  searchQuery?: string;
}

interface HomeContactHrefInput {
  intent?: ContactIntentChoice;
}

interface SecondaryProductContactHrefInput {
  intent?: ContactIntentChoice;
  productName?: string;
  productSlug?: string;
  routeLabel?: string;
  tech?: string;
}

type SearchParamSource =
  | URLSearchParams
  | { get(name: string): string | null }
  | Record<string, string | null | undefined>;

const isSearchParamReader = (
  value: SearchParamSource
): value is URLSearchParams | { get(name: string): string | null } =>
  typeof value === 'object' && value !== null && 'get' in value && typeof value.get === 'function';

const readSearchParam = (source: SearchParamSource, key: string): string | null => {
  if (isSearchParamReader(source)) {
    return source.get(key);
  }

  return source[key] ?? null;
};

const cleanValue = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const humanizeRouteSlug = (value: string): string =>
  value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const normalizeContactIntent = (
  value: string | null | undefined
): ContactIntentChoice | undefined => {
  switch (value) {
    case 'owner':
    case 'clinic':
    case 'curious':
    case 'rental':
      return value;
    default:
      return undefined;
  }
};

export const buildLocatorContactHref = ({
  city,
  country,
  intent = 'curious',
  modality,
  partnerName,
  partnerType,
}: LocatorContactHrefInput) => ({
  pathname: '/contact',
  query: {
    source: 'locator',
    intent,
    ...(country ? { country } : {}),
    ...(city ? { city } : {}),
    ...(modality ? { modality } : {}),
    ...(partnerType ? { partnerType } : {}),
    ...(partnerName ? { partnerName } : {}),
  },
});

export const buildPartnerContactHref = ({
  intent = 'clinic',
  partnerType,
}: PartnerContactHrefInput = {}) => ({
  pathname: '/contact',
  query: {
    source: 'partners',
    intent,
    ...(partnerType ? { partnerType } : {}),
  },
});

export const buildAffiliateContactHref = ({
  intent = 'curious',
  channelType,
}: AffiliateContactHrefInput = {}) => ({
  pathname: '/contact',
  query: {
    source: 'affiliate',
    intent,
    ...(channelType ? { channelType } : {}),
  },
});

export const buildLearningContactHref = ({
  intent = 'curious',
}: LearningContactHrefInput = {}) => ({
  pathname: '/contact',
  query: {
    source: 'learning',
    intent,
  },
});

export const buildMeridianContactHref = ({
  intent = 'curious',
}: MeridianContactHrefInput = {}) => ({
  pathname: '/contact',
  query: {
    source: 'meridian',
    intent,
  },
});

export const buildProduct3DLabContactHref = ({
  intent = 'curious',
}: Product3DLabContactHrefInput = {}) => ({
  pathname: '/contact',
  query: {
    source: 'testing-product-3d',
    intent,
  },
});

export const buildProductSecondaryRouteContactHref = ({
  intent = 'curious',
  productName,
  productSlug,
  routeLabel,
  tech,
}: SecondaryProductContactHrefInput = {}) => ({
  pathname: '/contact',
  query: {
    source: 'product-secondary',
    intent,
    ...((productSlug ?? tech) ? { productSlug: productSlug ?? tech } : {}),
    ...((productName ?? routeLabel)
      ? { productName: productName ?? routeLabel }
      : {}),
  },
});

export const buildSecondaryProductContactHref = buildProductSecondaryRouteContactHref;

export const buildSearchContactHref = ({
  intent = 'curious',
  searchQuery,
}: SearchContactHrefInput = {}) => ({
  pathname: '/contact',
  query: {
    source: 'search',
    intent,
    ...(searchQuery ? { searchQuery } : {}),
  },
});

export const buildHomeContactHref = ({
  intent = 'curious',
}: HomeContactHrefInput = {}) => ({
  pathname: '/contact',
  query: {
    source: 'home',
    intent,
  },
});

export const buildLocatorContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'curious';
  const country = cleanValue(readSearchParam(source, 'country'));
  const city = cleanValue(readSearchParam(source, 'city'));
  const modality = cleanValue(readSearchParam(source, 'modality'));
  const partnerType = cleanValue(readSearchParam(source, 'partnerType'));
  const partnerName = cleanValue(readSearchParam(source, 'partnerName'));

  const isLocatorRequest =
    entrySource === 'locator' || Boolean(country || city || modality || partnerType || partnerName);

  if (!isLocatorRequest) {
    return undefined;
  }

  const contextLines = [
    'I came from the Hylono partner locator and would like a guided introduction.',
    ...(partnerName ? [`Requested partner: ${partnerName}`] : []),
    ...(partnerType ? [`Partner type: ${partnerType}`] : []),
    ...(city ? [`City: ${city}`] : []),
    ...(country ? [`Country: ${country}`] : []),
    ...(modality ? [`Technology of interest: ${modality}`] : []),
  ];

  return {
    intent,
    subject: 'Partner locator introduction request',
    message: contextLines.join('\n'),
    ...(modality ? { interest: modality } : {}),
  };
};

export const buildPlannerContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const plannerState = parsePlannerSearchParams(source);
  const entrySource = cleanValue(readSearchParam(source, 'source'));

  if (!plannerState || entrySource !== 'planner') {
    return undefined;
  }

  const intent =
    normalizeContactIntent(readSearchParam(source, 'intent')) ??
    (plannerState.budgetMode === 'rental' ? 'rental' : 'curious');
  const selectedProducts = plannerState.productIds
    .map((productId) => {
      const matchingProduct = products.find((product) => product.id === productId);
      if (matchingProduct) {
        return matchingProduct.title;
      }

      if (productId.startsWith('tech-')) {
        const fallbackLabel = productId.replace(/^tech-/, '').toUpperCase();
        return fallbackLabel;
      }

      return undefined;
    })
    .filter((title): title is string => Boolean(title));
  const interest =
    plannerState.modality
      ? plannerModalityToContactInterest[plannerState.modality]
      : selectedProducts.length > 0
        ? (() => {
            const firstProduct = products.find((product) => product.id === plannerState.productIds[0]);
            if (!firstProduct) return undefined;

            switch (firstProduct.modality) {
              case 'HBOT':
              case 'O2':
                return 'hbot';
              case 'H2_inhalation':
              case 'H2_water':
                return 'hydrogen';
              case 'RLT_NIR':
                return 'rlt';
              case 'PEMF':
              case 'VNS':
                return 'pemf';
              default:
                return undefined;
            }
          })()
        : plannerState.productIds[0]?.startsWith('tech-')
          ? (() => {
              const fallbackKey = plannerState.productIds[0].replace(/^tech-/, '');
              switch (fallbackKey) {
                case 'hbot':
                  return 'hbot';
                case 'hydrogen':
                  return 'hydrogen';
                case 'rlt':
                  return 'rlt';
                case 'pemf':
                  return 'pemf';
                default:
                  return undefined;
              }
            })()
        : undefined;

  const contextLines = [
    'I came from the Hylono wellness planner and would like a follow-up on the suggested next step.',
    ...summarizePlannerSelection({
      ...plannerState,
      productTitles: selectedProducts,
    }),
    ...(plannerState.modality
      ? [`Planner modality label: ${plannerModalityLabels[plannerState.modality]}`]
      : []),
  ];

  return {
    intent,
    subject:
      intent === 'rental'
        ? 'Wellness planner rental follow-up'
        : 'Wellness planner guidance follow-up',
    message: contextLines.join('\n'),
    ...(interest ? { interest } : {}),
  };
};

export const buildPartnerContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'clinic';
  const partnerType = cleanValue(readSearchParam(source, 'partnerType'));

  if (entrySource !== 'partners') {
    return undefined;
  }

  const contextLines = [
    'I came from the Hylono partner access page and would like a manual commercial follow-up.',
    ...(partnerType ? [`Requested path: ${partnerType}`] : []),
  ];

  return {
    intent,
    subject: 'Partner access inquiry',
    message: contextLines.join('\n'),
  };
};

export const buildAffiliateContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'curious';
  const channelType = cleanValue(readSearchParam(source, 'channelType'));

  if (entrySource !== 'affiliate') {
    return undefined;
  }

  const contextLines = [
    'I came from the Hylono affiliate inquiries page and would like a manual affiliate or referral review.',
    ...(channelType ? [`Requested path: ${channelType}`] : []),
  ];

  return {
    intent,
    subject: 'Affiliate inquiry',
    message: contextLines.join('\n'),
  };
};

export const buildLearningContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'curious';

  if (entrySource !== 'learning') {
    return undefined;
  }

  return {
    intent,
    subject: 'Learning hub follow-up',
    message:
      'I came from the Hylono learning hub and would like help choosing the most useful next resource or support path.',
  };
};

export const buildMeridianContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'curious';

  if (entrySource !== 'meridian') {
    return undefined;
  }

  return {
    intent,
    subject: 'Meridian guide follow-up',
    message:
      'I came from the Hylono Meridian guide and would like help choosing the most useful next page or support path.',
  };
};

export const buildProduct3DLabContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'curious';

  if (entrySource !== 'testing-product-3d') {
    return undefined;
  }

  return {
    intent,
    subject: 'Product 3D asset lab follow-up',
    message:
      'I came from the Hylono product 3D asset lab and would like help reaching the strongest published product or support page for this request.',
  };
};

export const buildSecondaryProductContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'curious';
  const productSlug =
    cleanValue(readSearchParam(source, 'productSlug')) ??
    cleanValue(readSearchParam(source, 'tech'));
  const productName =
    cleanValue(readSearchParam(source, 'productName')) ??
    cleanValue(readSearchParam(source, 'routeLabel')) ??
    (productSlug ? humanizeRouteSlug(productSlug) : undefined);

  if (entrySource !== 'product-secondary' || !productSlug) {
    return undefined;
  }

  const resolvedProductName = productName ?? 'this page';
  const contextLines = [
    `I came from the Hylono secondary product page for ${resolvedProductName} and would like help reaching the strongest published next step.`,
    `Page slug: ${productSlug}`,
  ];

  return {
    intent,
    subject: `${resolvedProductName} page follow-up`,
    message: contextLines.join('\n'),
  };
};

export const buildSearchContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'curious';
  const searchQuery = cleanValue(readSearchParam(source, 'searchQuery'));

  if (entrySource !== 'search' && !searchQuery) {
    return undefined;
  }

  const contextLines = [
    'I came from the Hylono search utility and would like help finding the strongest next page or support path.',
    ...(searchQuery ? [`I searched for: ${searchQuery}`] : []),
  ];

  return {
    intent,
    subject: 'Search utility follow-up',
    message: contextLines.join('\n'),
  };
};

export const buildHomeContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined => {
  const entrySource = cleanValue(readSearchParam(source, 'source'));
  const intent = normalizeContactIntent(readSearchParam(source, 'intent')) ?? 'curious';

  if (entrySource !== 'home') {
    return undefined;
  }

  if (intent === 'clinic') {
    return {
      intent,
      subject: 'Clinic / B2B inquiry',
      message:
        'I came from the Hylono homepage and would like help planning a clinic, studio, or team deployment path.',
    };
  }

  return {
    intent,
    subject: 'Homepage consultation request',
    message:
      'I came from the Hylono homepage and would like help choosing the right consultation, rental, or ownership path.',
  };
};

export const buildHbotQuotePrefill = (source: SearchParamSource): ContactPrefill | undefined => {
  if (readSearchParam(source, 'source') !== 'hbot-quote') return undefined;
  const model = cleanValue(readSearchParam(source, 'productName'))?.slice(0, 160) ?? 'HBOT chamber';
  return {
    intent: 'curious',
    interest: 'hbot',
    subject: `${model} quote request`,
    message: `I would like a quote for ${model}.\nDelivery country:\nPreferred timing:\nQuestions about setup:`,
  };
};

export const buildContactPrefill = (
  source: SearchParamSource
): ContactPrefill | undefined =>
  buildHbotQuotePrefill(source) ??
  buildPlannerContactPrefill(source) ??
  buildHomeContactPrefill(source) ??
  buildPartnerContactPrefill(source) ??
  buildAffiliateContactPrefill(source) ??
  buildLearningContactPrefill(source) ??
  buildMeridianContactPrefill(source) ??
  buildProduct3DLabContactPrefill(source) ??
  buildSecondaryProductContactPrefill(source) ??
  buildSearchContactPrefill(source) ??
  buildLocatorContactPrefill(source);
