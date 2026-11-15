import { TechType } from '../types';

const TECH_TYPES = Object.values(TechType) as TechType[];
const NON_INDEXABLE_PRODUCT_ROUTE_SLUG_SET = new Set([
  'cryo',
  'ems',
  'ewot',
  'hypoxic',
  'sauna_blanket',
  'vns',
]);
const STATIC_PRODUCT_ROUTE_SLUG_SET = new Set<string>([
  // Clone routes (hbot2, rental2, rlt2) were removed 2026-09-28; the set stays
  // as the extension point if static clone slugs ever return.
]);

export const LEGACY_PRODUCT_ROUTE_REDIRECTS = {
  'h2-hop450': 'hydrogen',
  'hbot-st1700': 'hbot',
} as const;

export const NON_INDEXABLE_PRODUCT_ROUTE_SLUGS = Array.from(
  NON_INDEXABLE_PRODUCT_ROUTE_SLUG_SET
);
export const STATIC_PRODUCT_ROUTE_SLUGS = Array.from(STATIC_PRODUCT_ROUTE_SLUG_SET);

export const getTechRouteSlug = (tech: TechType): string => tech.toLowerCase();

export const getAllTechRouteSlugs = (): string[] => TECH_TYPES.map(getTechRouteSlug);

export const getIndexableTechRouteSlugs = (): string[] =>
  getAllTechRouteSlugs().filter((slug) => !NON_INDEXABLE_PRODUCT_ROUTE_SLUG_SET.has(slug));

export const isIndexableProductRouteSlug = (slug: string): boolean =>
  !NON_INDEXABLE_PRODUCT_ROUTE_SLUG_SET.has(slug.trim().toLowerCase());

export const isStaticProductRouteSlug = (slug: string): boolean =>
  STATIC_PRODUCT_ROUTE_SLUG_SET.has(slug.trim().toLowerCase());

export const getTechTypeFromRouteSlug = (value: string): TechType | null => {
  const normalized = value.trim().toUpperCase();
  return TECH_TYPES.includes(normalized as TechType) ? (normalized as TechType) : null;
};

type PublicProductRouteCopyInput = {
  fallbackDescription?: string;
  fallbackBenefits?: string[];
  productName: string;
  slug: string;
};

type PublicProductRouteSynergyInput = {
  fallbackDescription?: string;
  fallbackLabel?: string;
  sourceName: string;
  sourceSlug: string;
  targetName: string;
  targetSlug: string;
};

const SECONDARY_PRODUCT_ROUTE_PUBLIC_COPY: Record<
  string,
  {
    benefits: string[];
    description: string;
  }
> = {
  cryo: {
    benefits: ['Safety screening', 'Session fit', 'Policy review', 'Support handoff'],
    description:
      'Use cryo questions as secondary equipment context. Review research limits, safety screening, rental terms, and support before treating it as a product-detail decision.',
  },
  ems: {
    benefits: ['Fit screening', 'Session setup', 'Training context', 'Support handoff'],
    description:
      'Use EMS suit questions as secondary equipment context. Review suitability, session setup, rental terms, and support before treating it as a product-detail decision.',
  },
  ewot: {
    benefits: ['Oxygen context', 'Session setup', 'Research limits', 'Support handoff'],
    description:
      'Use EWOT questions as secondary equipment context. Review oxygen-session setup, research limits, rental terms, and support before treating it as a product-detail decision.',
  },
  hypoxic: {
    benefits: ['Altitude context', 'Screening questions', 'Session setup', 'Support handoff'],
    description:
      'Use hypoxic generator questions as secondary equipment context. Review altitude-session screening, safety limits, rental terms, and support before treating it as a product-detail decision.',
  },
  sauna_blanket: {
    benefits: ['Heat routine fit', 'Safety screening', 'Rental terms', 'Support handoff'],
    description:
      'Use sauna blanket questions as secondary equipment context. Review heat-routine fit, safety screening, rental terms, and support before treating it as a product-detail decision.',
  },
  vns: {
    benefits: ['Suitability review', 'Setup guidance', 'Research limits', 'Support handoff'],
    description:
      'Use VNS device questions as secondary equipment context. Review suitability, setup guidance, research limits, and support before treating it as a product-detail decision.',
  },
};

export const getPublicProductRouteDescription = ({
  fallbackDescription = '',
  productName,
  slug,
}: PublicProductRouteCopyInput): string => {
  const normalizedSlug = slug.trim().toLowerCase();
  return (
    SECONDARY_PRODUCT_ROUTE_PUBLIC_COPY[normalizedSlug]?.description ||
    fallbackDescription ||
    `Use ${productName} questions as product context and review support before making a product-detail decision.`
  );
};

export const getPublicProductRouteBenefits = ({
  fallbackBenefits = [],
  productName,
  slug,
}: PublicProductRouteCopyInput): string[] => {
  const normalizedSlug = slug.trim().toLowerCase();
  return (
    SECONDARY_PRODUCT_ROUTE_PUBLIC_COPY[normalizedSlug]?.benefits ||
    fallbackBenefits ||
    [`${productName} context`, 'Support review']
  );
};

export const getPublicProductRouteSynergy = ({
  fallbackDescription = '',
  fallbackLabel = '',
  sourceName,
  sourceSlug,
  targetName,
  targetSlug,
}: PublicProductRouteSynergyInput): { description: string; label: string } => {
  const sourceIsSecondary = NON_INDEXABLE_PRODUCT_ROUTE_SLUG_SET.has(
    sourceSlug.trim().toLowerCase()
  );
  const targetIsSecondary = NON_INDEXABLE_PRODUCT_ROUTE_SLUG_SET.has(
    targetSlug.trim().toLowerCase()
  );

  if (!sourceIsSecondary && !targetIsSecondary) {
    return {
      description:
        fallbackDescription ||
        `Review ${sourceName} and ${targetName} together as a planning question before treating the combination as a protocol.`,
      label: fallbackLabel || `${sourceName} + ${targetName}`,
    };
  }

  return {
    description: `Review ${sourceName} and ${targetName} together as a planning question. Confirm suitability, sequence, rental terms, and support before treating the combination as a protocol.`,
    label: 'Bundle planning review',
  };
};
