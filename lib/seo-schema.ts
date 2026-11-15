import { env } from '@/lib/env';
import { PRICE_BOOK_CURRENCY } from '@/lib/money';
import { siteEntity } from '@/content/site-entity';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const SCHEMA_COPYRIGHT_YEAR = 2026;
const SCHEMA_COPYRIGHT_NOTICE = `(c) ${SCHEMA_COPYRIGHT_YEAR} Hylono. All rights reserved.`;

// Most recent content + schema update date - update when making substantive changes.
export const SCHEMA_DATE_MODIFIED = '2026-04-12';

export type SchemaItemAvailability =
  | 'https://schema.org/BackOrder'
  | 'https://schema.org/Discontinued'
  | 'https://schema.org/InStock'
  | 'https://schema.org/InStoreOnly'
  | 'https://schema.org/LimitedAvailability'
  | 'https://schema.org/MadeToOrder'
  | 'https://schema.org/OnlineOnly'
  | 'https://schema.org/OutOfStock'
  | 'https://schema.org/PreOrder'
  | 'https://schema.org/PreSale'
  | 'https://schema.org/Reserved'
  | 'https://schema.org/SoldOut';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FaqSchemaItem {
  question: string;
  answer: string;
}

export const ORGANIZATION_ID = () => `${SITE_URL}/#organization`;
export const WEBSITE_ID = () => `${SITE_URL}/#website`;
export const WARRANTY_PROMISE_ID = () => `${SITE_URL}/warranty#standard-warranty`;

export const createWarrantyPromiseSchema = ({
  includeContext = false,
  includeSiteLink = false,
}: {
  includeContext?: boolean;
  includeSiteLink?: boolean;
} = {}) => ({
  ...(includeContext ? { '@context': 'https://schema.org' } : {}),
  '@type': 'WarrantyPromise',
  '@id': WARRANTY_PROMISE_ID(),
  url: `${SITE_URL}/warranty`,
  name: 'Hylono 2-Year Standard Warranty',
  description:
    'All Hylono devices include a 2-year standard warranty covering manufacturing defects, component failures, electronic malfunctions, and structural issues at no cost.',
  durationOfWarranty: {
    '@type': 'QuantitativeValue',
    value: 2,
    unitCode: 'ANN',
    unitText: 'years',
  },
  warrantyScope: 'https://schema.org/PartsAndLabor',
  seller: { '@id': ORGANIZATION_ID() },
  ...(includeSiteLink ? { isPartOf: { '@id': WEBSITE_ID() } } : {}),
});

export const createMerchantReturnPolicySchema = ({
  includeContext = false,
  includeName = false,
  includePublisher = false,
}: {
  includeContext?: boolean;
  includeName?: boolean;
  includePublisher?: boolean;
} = {}) => ({
  ...(includeContext ? { '@context': 'https://schema.org' } : {}),
  '@type': 'MerchantReturnPolicy',
  '@id': `${SITE_URL}/returns#return-policy`,
  ...(includeName ? { name: 'Hylono 30-Day Return Policy' } : {}),
  url: `${SITE_URL}/returns`,
  applicableCountry: 'EU',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 30,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
  refundType: 'https://schema.org/FullRefund',
  inStoreReturnsOffered: false,
  merchantReturnLink: `${SITE_URL}/returns`,
  ...(includePublisher
    ? {
        publisher: { '@id': ORGANIZATION_ID() },
        isPartOf: { '@id': WEBSITE_ID() },
      }
    : {}),
});

export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness', 'HealthAndBeautyBusiness'],
  '@id': ORGANIZATION_ID(),
  name: siteEntity.name,
  legalName: siteEntity.legalName,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.svg`,
    contentUrl: `${SITE_URL}/logo.svg`,
    name: siteEntity.name,
    width: 512,
    height: 512,
  },
  image: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-image.svg`,
    name: siteEntity.name,
    width: 1200,
    height: 630,
  },
  description: siteEntity.description,
  email: siteEntity.contactEmail,
  areaServed: siteEntity.serviceArea,
  knowsLanguage: { '@type': 'Language', name: 'English', alternateName: 'en' },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: siteEntity.supportEmail,
      telephone: siteEntity.phone,
      availableLanguage: ['en'],
      areaServed: siteEntity.serviceArea,
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: siteEntity.contactEmail,
      availableLanguage: ['en'],
      areaServed: siteEntity.serviceArea,
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    },
    {
      '@type': 'ContactPoint',
      contactType: 'technical support',
      email: siteEntity.supportEmail,
      availableLanguage: ['en'],
      areaServed: siteEntity.serviceArea,
      url: `${SITE_URL}/help`,
    },
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
  telephone: siteEntity.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteEntity.address.streetAddress,
    addressLocality: siteEntity.address.addressLocality,
    postalCode: siteEntity.address.postalCode,
    addressCountry: siteEntity.address.addressCountry,
  },
  currenciesAccepted: siteEntity.transactionCurrency,
  sameAs: [
    'https://www.instagram.com/hylono',
    'https://x.com/hylono',
    'https://www.linkedin.com/company/hylono',
    'https://www.youtube.com/@hylono',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Hylono wellness technology devices',
    url: `${SITE_URL}/store`,
  },
  makesOffer: [
    { '@id': `${SITE_URL}/rental#service` },
    { '@id': `${SITE_URL}/rental#rental-product` },
  ],
  brand: {
    '@type': 'Brand',
    '@id': `${SITE_URL}/#brand`,
    name: siteEntity.name,
    url: SITE_URL,
    image: `${SITE_URL}/logo.svg`,
    sameAs: [
      'https://www.instagram.com/hylono',
      'https://x.com/hylono',
      'https://www.linkedin.com/company/hylono',
      'https://www.youtube.com/@hylono',
    ],
  },
  owns: { '@type': 'Brand', '@id': `${SITE_URL}/#brand` },
  termsOfService: `${SITE_URL}/terms`,
  privacyPolicy: `${SITE_URL}/privacy`,
  publishingPrinciples: `${SITE_URL}/about`,
  // Node references, not declarations: every `@id` below is declared by its owning route
  // module, which renders only on that page. A `@type` here re-declared those nodes in the
  // Organization node, which the root layout emits on every page, so each page also
  // carried a competing stub for a node it does not own.
  subjectOf: [
    { '@id': `${SITE_URL}/about`, url: `${SITE_URL}/about` },
    { '@id': `${SITE_URL}/press`, url: `${SITE_URL}/press` },
    { '@id': `${SITE_URL}/research`, url: `${SITE_URL}/research` },
  ],
});

export const createWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID(),
  name: siteEntity.name,
  url: SITE_URL,
  description: siteEntity.description,
  keywords: [
    'hyperbaric oxygen therapy',
    'hydrogen wellness technology',
    'red light therapy',
    'PEMF therapy',
    'wellness technology rental',
    'guided wellness technology',
    'evidence-informed wellness',
    'HBOT',
  ],
  inLanguage: 'en',
  isAccessibleForFree: true,
  audience: {
    '@type': 'Audience',
    audienceType: 'Health-Conscious Consumers',
    geographicArea: { '@type': 'Place', name: 'European Union' },
  },
  dateCreated: '2022',
  image: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-image.svg`,
    width: 1200,
    height: 630,
    name: siteEntity.name,
  },
  publisher: { '@id': ORGANIZATION_ID() },
  author: { '@id': ORGANIZATION_ID() },
  copyrightHolder: { '@id': ORGANIZATION_ID() },
  copyrightYear: SCHEMA_COPYRIGHT_YEAR,
  copyrightNotice: SCHEMA_COPYRIGHT_NOTICE,
  maintainer: { '@id': ORGANIZATION_ID() },
  about: { '@id': ORGANIZATION_ID() },
  mainEntity: { '@id': ORGANIZATION_ID() },
  dateModified: SCHEMA_DATE_MODIFIED,
  publishingPrinciples: `${SITE_URL}/about`,
  privacyPolicy: `${SITE_URL}/privacy`,
  editorialPolicies: `${SITE_URL}/about`,
  // Node references, not declarations: the WebSite node is emitted on every page, so a
  // `@type` here re-declared nine page-owned nodes site-wide. `/faq#faq` in particular is
  // declared by `createFaqSchema` on the FAQ route with its `mainEntity` questions, and a
  // competing stub without `mainEntity` put the FAQ rich result at risk.
  hasPart: [
    { '@id': `${SITE_URL}/store`, url: `${SITE_URL}/store` },
    { '@id': `${SITE_URL}/rental`, url: `${SITE_URL}/rental` },
    { '@id': `${SITE_URL}/protocols`, url: `${SITE_URL}/protocols` },
    { '@id': `${SITE_URL}/conditions`, url: `${SITE_URL}/conditions` },
    { '@id': `${SITE_URL}/research`, url: `${SITE_URL}/research` },
    { '@id': `${SITE_URL}/blog`, url: `${SITE_URL}/blog` },
    { '@id': `${SITE_URL}/faq#faq`, url: `${SITE_URL}/faq` },
    { '@id': `${SITE_URL}/contact`, url: `${SITE_URL}/contact` },
    { '@id': `${SITE_URL}/about`, url: `${SITE_URL}/about` },
  ],
});

export const createBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  const leaf = items[items.length - 1];
  const leafPath = leaf?.path ?? '/';
  const breadcrumbId =
    leafPath === '/' ? `${SITE_URL}/#breadcrumb` : `${SITE_URL}${leafPath}#breadcrumb`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path === '/' ? SITE_URL : `${SITE_URL}${item.path}`,
    })),
  };
};

export const createCollectionPageSchema = ({
  name,
  description,
  path,
  dateModified,
  imageUrl,
}: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
  imageUrl?: string;
}) => {
  const pageId = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  const breadcrumbId = path === '/' ? `${SITE_URL}/#breadcrumb` : `${SITE_URL}${path}#breadcrumb`;
  const resolvedImageUrl = imageUrl ?? `${SITE_URL}/og-image.svg`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageId,
    name,
    description,
    url: pageId,
    inLanguage: 'en',
    isAccessibleForFree: true,
    accessMode: 'textual',
    accessModeSufficient: [{ '@type': 'ItemList', itemListElement: ['textual'] }],
    accessibilityFeature: ['alternativeText', 'readingOrder', 'structuredNavigation'],
    image: {
      '@type': 'ImageObject',
      url: resolvedImageUrl,
      width: 1200,
      height: 630,
      name,
    },
    thumbnailUrl: resolvedImageUrl,
    isPartOf: { '@id': WEBSITE_ID() },
    author: { '@id': ORGANIZATION_ID() },
    publisher: { '@id': ORGANIZATION_ID() },
    copyrightHolder: { '@id': ORGANIZATION_ID() },
    copyrightYear: SCHEMA_COPYRIGHT_YEAR,
    copyrightNotice: SCHEMA_COPYRIGHT_NOTICE,
    breadcrumb: { '@id': breadcrumbId },
    potentialAction: { '@type': 'ReadAction', target: [pageId] },
    ...(dateModified ? { dateModified, datePublished: dateModified } : {}),
  };
};

export const createWebPageSchema = ({
  name,
  description,
  path,
  dateModified,
  imageUrl,
}: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
  imageUrl?: string;
}) => {
  const pageId = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  const breadcrumbId = path === '/' ? `${SITE_URL}/#breadcrumb` : `${SITE_URL}${path}#breadcrumb`;
  const resolvedImageUrl = imageUrl ?? `${SITE_URL}/og-image.svg`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageId,
    name,
    description,
    url: pageId,
    inLanguage: 'en',
    isAccessibleForFree: true,
    accessMode: 'textual',
    accessModeSufficient: [{ '@type': 'ItemList', itemListElement: ['textual'] }],
    accessibilityFeature: ['alternativeText', 'readingOrder', 'structuredNavigation'],
    image: {
      '@type': 'ImageObject',
      url: resolvedImageUrl,
      width: 1200,
      height: 630,
      name,
    },
    thumbnailUrl: resolvedImageUrl,
    isPartOf: { '@id': WEBSITE_ID() },
    author: { '@id': ORGANIZATION_ID() },
    publisher: { '@id': ORGANIZATION_ID() },
    copyrightHolder: { '@id': ORGANIZATION_ID() },
    copyrightYear: SCHEMA_COPYRIGHT_YEAR,
    copyrightNotice: SCHEMA_COPYRIGHT_NOTICE,
    breadcrumb: { '@id': breadcrumbId },
    potentialAction: { '@type': 'ReadAction', target: [pageId] },
    ...(dateModified ? { dateModified, datePublished: dateModified } : {}),
  };
};

export interface CitationItem {
  title: string;
  url: string;
  doi?: string;
  year?: number;
  authors?: string;
}

/**
 * Emits the page node for research, condition-guide, and protocol routes.
 *
 * The node is typed `MedicalWebPage`, the schema.org medical subtype of `WebPage`, because
 * the `specialty`, `usesHealthAspectEnumeration`, `reviewedBy`, and `citation` properties
 * emitted below are only defined on a medical-typed node and read as type/property
 * mismatches on a plain `WebPage`. The type describes the subject matter of these
 * evidence-informed wellness guides; it is not a clinical, diagnostic, or efficacy claim.
 *
 * Paths passed here must stay disjoint from `createWebPageSchema` and
 * `createCollectionPageSchema` paths, so one `@id` is never declared by two factories.
 */
export const createMedicalWebPageSchema = ({
  name,
  description,
  abstract,
  path,
  about,
  citations,
  mainEntity,
  reviewedByName,
  speakableSelectors,
  dateModified,
  datePublished,
  lastReviewed,
}: {
  name: string;
  description: string;
  abstract?: string;
  path: string;
  about?: string[];
  citations?: CitationItem[];
  mainEntity?: object;
  reviewedByName?: string;
  speakableSelectors?: string[];
  dateModified?: string;
  datePublished?: string;
  lastReviewed?: string;
}) => {
  const pageId = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  const breadcrumbId = path === '/' ? `${SITE_URL}/#breadcrumb` : `${SITE_URL}${path}#breadcrumb`;
  return ({
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  '@id': pageId,
  name,
  description,
  ...(abstract ? { abstract } : {}),
  url: pageId,
  inLanguage: 'en',
  isAccessibleForFree: true,
  accessMode: 'textual',
  accessModeSufficient: [{ '@type': 'ItemList', itemListElement: ['textual'] }],
  image: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-image.svg`,
    width: 1200,
    height: 630,
    name,
  },
  thumbnailUrl: `${SITE_URL}/og-image.svg`,
  audience: {
    '@type': 'Audience',
    audienceType: 'Wellness planning readers',
  },
  isPartOf: { '@id': WEBSITE_ID() },
  author: { '@id': ORGANIZATION_ID() },
  publisher: { '@id': ORGANIZATION_ID() },
  copyrightHolder: { '@id': ORGANIZATION_ID() },
  copyrightYear: SCHEMA_COPYRIGHT_YEAR,
  copyrightNotice: SCHEMA_COPYRIGHT_NOTICE,
  accessibilityFeature: ['alternativeText', 'readingOrder', 'structuredNavigation'],
  specialty: 'https://schema.org/Wellness',
  usesHealthAspectEnumeration: [
    'https://schema.org/BenefitsHealthAspect',
    'https://schema.org/HowItWorksHealthAspect',
    'https://schema.org/OverviewHealthAspect',
    'https://schema.org/SafetyHealthAspect',
    'https://schema.org/EffectivenessHealthAspect',
    'https://schema.org/UsageOrScheduleHealthAspect',
    'https://schema.org/RelatedTopicsHealthAspect',
  ],
  breadcrumb: { '@id': breadcrumbId },
  ...(datePublished ? { datePublished } : dateModified ? { datePublished: dateModified } : {}),
  ...(about && about.length > 0
    ? {
        about: about.map((term) => ({
          '@type': 'DefinedTerm',
          name: term,
        })),
      }
    : {}),
  ...(citations && citations.length > 0
    ? {
        citation: citations.map((c) => ({
          '@type': 'ScholarlyArticle',
          '@id': c.doi ? `https://doi.org/${c.doi}` : c.url,
          headline: c.title,
          url: c.url,
          ...(c.year ? { datePublished: c.year.toString() } : {}),
          ...(c.authors ? { author: { '@type': 'Person', name: c.authors } } : {}),
          ...(c.doi
            ? { identifier: { '@type': 'PropertyValue', propertyID: 'doi', value: c.doi } }
            : {}),
        })),
      }
    : {}),
  ...(mainEntity ? { mainEntity } : {}),
  ...(reviewedByName
    ? {
        reviewedBy: {
          '@type': 'Organization',
          '@id': ORGANIZATION_ID(),
          name: reviewedByName,
          url: `${SITE_URL}/about`,
        },
      }
    : {}),
  ...(speakableSelectors && speakableSelectors.length > 0
    ? {
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: speakableSelectors,
        },
      }
    : {}),
  ...(dateModified ? { dateModified } : {}),
  ...(lastReviewed ? { lastReviewed } : {}),
  potentialAction: { '@type': 'ReadAction', target: [pageId] },
});
};

export const createFaqSchema = (items: FaqSchemaItem[], path?: string, name?: string) => {
  const pageUrl = path ? (path === '/' ? SITE_URL : `${SITE_URL}${path}`) : undefined;
  return {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  ...(name ? { name } : {}),
  ...(pageUrl
    ? {
        '@id': `${pageUrl}#faq`,
        url: pageUrl,
        potentialAction: { '@type': 'ReadAction', target: [pageUrl] },
      }
    : {}),
  inLanguage: 'en',
  isAccessibleForFree: true,
  accessModeSufficient: [{ '@type': 'ItemList', itemListElement: ['textual'] }],
  accessibilityFeature: ['alternativeText', 'readingOrder', 'structuredNavigation'],
  isPartOf: { '@id': WEBSITE_ID() },
  author: { '@id': ORGANIZATION_ID() },
  publisher: { '@id': ORGANIZATION_ID() },
  dateModified: SCHEMA_DATE_MODIFIED,
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
  };
};

export const createBlogPostingSchema = ({
  articleSection,
  authorName,
  dateModified,
  datePublished,
  description,
  headline,
  path,
  wordCount,
}: {
  articleSection: string;
  authorName: string;
  dateModified?: string | null;
  datePublished: string;
  description: string;
  headline: string;
  path: string;
  wordCount?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  '@id': `${SITE_URL}${path}#article`,
  headline,
  description,
  abstract: description,
  url: `${SITE_URL}${path}`,
  inLanguage: 'en',
  isAccessibleForFree: true,
  accessMode: 'textual',
  accessModeSufficient: [{ '@type': 'ItemList', itemListElement: ['textual'] }],
  accessibilityFeature: ['alternativeText', 'readingOrder', 'structuredNavigation'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}${path}`,
  },
  articleSection,
  keywords: articleSection,
  about: { '@type': 'DefinedTerm', name: articleSection },
  datePublished,
  dateModified: dateModified ?? datePublished,
  ...(wordCount ? { wordCount } : {}),
  image: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-image.svg`,
    contentUrl: `${SITE_URL}/og-image.svg`,
    width: 1200,
    height: 630,
    name: headline,
    caption: headline,
  },
  thumbnailUrl: `${SITE_URL}/og-image.svg`,
  author: {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID(),
    name: authorName,
    url: `${SITE_URL}/about`,
  },
  publisher: { '@id': ORGANIZATION_ID() },
  copyrightHolder: { '@id': ORGANIZATION_ID() },
  copyrightYear: SCHEMA_COPYRIGHT_YEAR,
  copyrightNotice: SCHEMA_COPYRIGHT_NOTICE,
  audience: {
    '@type': 'Audience',
    audienceType: 'Health-Conscious Consumers',
  },
  isPartOf: { '@type': 'CollectionPage', '@id': `${SITE_URL}/blog`, url: `${SITE_URL}/blog` },
});

export const createProductSchema = ({
  name,
  description,
  path,
  price,
  // Was the literal 'EUR' while the price book is denominated in PLN, so any
  // caller omitting this defaulted to declaring the wrong currency to Google.
  priceCurrency = PRICE_BOOK_CURRENCY,
  availability,
  imageUrl,
}: {
  name: string;
  description: string;
  path: string;
  price?: number;
  priceCurrency?: string;
  availability?: SchemaItemAvailability;
  imageUrl?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${SITE_URL}${path}#product`,
  name,
  description,
  brand: {
    '@type': 'Brand',
    '@id': `${SITE_URL}/#brand`,
    name: siteEntity.name,
    url: SITE_URL,
  },
  category: 'Wellness Technology',
  url: `${SITE_URL}${path}`,
  audience: {
    '@type': 'PeopleAudience',
    audienceType: 'Health-Conscious Consumers',
    geographicArea: { '@type': 'Place', name: 'European Union' },
  },
  isPartOf: { '@id': WEBSITE_ID() },
  hasWarranty: { '@id': WARRANTY_PROMISE_ID() },
  potentialAction: [
    {
      '@type': 'RentAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/rental`,
        actionPlatform: 'https://schema.org/DesktopWebPlatform',
      },
      name: 'Rent this device',
    },
    {
      '@type': 'BuyAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}${path}`,
        actionPlatform: 'https://schema.org/DesktopWebPlatform',
      },
      name: 'Purchase this device',
    },
  ],
  ...(imageUrl
    ? {
        image: {
          '@type': 'ImageObject',
          url: `${SITE_URL}${imageUrl}`,
          caption: name,
          name,
          width: 1200,
          height: 800,
        },
      }
    : {}),
  ...(typeof price === 'number'
    ? {
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}${path}`,
          priceCurrency,
          price,
          validFrom: SCHEMA_DATE_MODIFIED,
          itemCondition: 'https://schema.org/NewCondition',
          ...(availability ? { availability } : {}),
          eligibleRegion: { '@type': 'Place', name: 'European Union' },
          seller: { '@id': ORGANIZATION_ID() },
          shippingDetails: { '@id': `${SITE_URL}/shipping#shipping-policy` },
          hasMerchantReturnPolicy: createMerchantReturnPolicySchema(),
        },
      }
    : {}),
});

export const createRentalProductSchema = ({
  name,
  description,
  path,
  monthlyPrice,
}: {
  name: string;
  description: string;
  path: string;
  monthlyPrice: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${SITE_URL}${path}#rental-product`,
  name,
  description,
  category: 'Wellness Technology Rental',
  inLanguage: 'en',
  url: `${SITE_URL}${path}`,
  audience: {
    '@type': 'PeopleAudience',
    audienceType: 'Health-Conscious Consumers',
    geographicArea: { '@type': 'Place', name: 'European Union' },
  },
  isPartOf: { '@id': WEBSITE_ID() },
  image: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-image.svg`,
    contentUrl: `${SITE_URL}/og-image.svg`,
    width: 1200,
    height: 630,
    name,
  },
  brand: {
    '@type': 'Brand',
    '@id': `${SITE_URL}/#brand`,
    name: siteEntity.name,
    url: SITE_URL,
  },
  hasWarranty: { '@id': WARRANTY_PROMISE_ID() },
  potentialAction: {
    '@type': 'RentAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}${path}`,
      actionPlatform: 'https://schema.org/DesktopWebPlatform',
    },
    name: 'Start rental plan',
  },
  offers: {
    '@type': 'Offer',
    url: `${SITE_URL}${path}`,
    priceCurrency: PRICE_BOOK_CURRENCY,
    price: monthlyPrice,
    validFrom: SCHEMA_DATE_MODIFIED,
    itemCondition: 'https://schema.org/NewCondition',
    eligibleRegion: { '@type': 'Place', name: 'European Union' },
    businessFunction: 'https://purl.org/goodrelations/v1#LeaseOut',
    seller: { '@id': ORGANIZATION_ID() },
    shippingDetails: { '@id': `${SITE_URL}/shipping#shipping-policy` },
    hasMerchantReturnPolicy: createMerchantReturnPolicySchema(),
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      priceCurrency: PRICE_BOOK_CURRENCY,
      price: monthlyPrice,
      billingDuration: 1,
      unitText: 'month',
      referenceQuantity: {
        '@type': 'QuantitativeValue',
        value: 1,
        unitCode: 'MON',
      },
    },
  },
});

export const createRentalServiceSchema = ({
  name,
  description,
  path,
  monthlyPrice,
}: {
  name: string;
  description: string;
  path: string;
  monthlyPrice: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}${path}#service`,
  name,
  description,
  serviceType: 'Wellness Equipment Rental',
  category: 'Wellness Technology',
  url: `${SITE_URL}${path}`,
  inLanguage: 'en',
  provider: { '@id': ORGANIZATION_ID() },
  areaServed: siteEntity.serviceArea,
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${SITE_URL}${path}`,
    serviceEmail: siteEntity.contactEmail,
    availableLanguage: ['en'],
  },
  offers: {
    '@type': 'Offer',
    priceCurrency: PRICE_BOOK_CURRENCY,
    price: monthlyPrice,
    validFrom: SCHEMA_DATE_MODIFIED,
    itemCondition: 'https://schema.org/NewCondition',
    eligibleRegion: { '@type': 'Place', name: 'European Union' },
    seller: { '@id': ORGANIZATION_ID() },
  },
  serviceOutput: {
    '@type': 'Product',
    '@id': `${SITE_URL}${path}#rental-product`,
    name,
    category: 'Wellness Technology Rental',
    brand: { '@type': 'Brand', '@id': `${SITE_URL}/#brand`, name: siteEntity.name },
  },
  termsOfService: `${SITE_URL}/terms`,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Hylono rental plans',
    url: `${SITE_URL}${path}`,
  },
  isRelatedTo: [
    { '@type': 'Service', name: 'Device Onboarding Support', provider: { '@id': ORGANIZATION_ID() } },
    { '@type': 'Service', name: 'Technical Support', provider: { '@id': ORGANIZATION_ID() } },
  ],
  isPartOf: { '@id': WEBSITE_ID() },
});

export interface SecondaryProductSchemaOptions {
  name: string;
  description: string;
  path: string;
  category?: string;
  technicalSpecs?: Array<{ label: string; value: string }>;
  model?: string;
  imageUrl?: string;
  similarProductPaths?: string[];
}

/**
 * Creates schema.org Product markup for secondary and orientation product routes
 * (e.g., /product/ems, /product/cryo, /product/ewot, /product/hypoxic, /product/sauna_blanket, /product/vns).
 *
 * Invariant: Never emits a commercial 'offers' property to prevent deceptive ecommerce claims on
 * non-checkout / request-only secondary routes while still preserving rich device indexing.
 */
export const createSecondaryProductSchema = ({
  name,
  description,
  path,
  category = 'Wellness Technology',
  technicalSpecs,
  model,
  imageUrl,
  similarProductPaths,
}: SecondaryProductSchemaOptions) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${SITE_URL}${path}#product`,
  name,
  description,
  category,
  url: `${SITE_URL}${path}`,
  brand: {
    '@type': 'Brand',
    '@id': `${SITE_URL}/#brand`,
    name: siteEntity.name,
    url: SITE_URL,
  },
  audience: {
    '@type': 'PeopleAudience',
    audienceType: 'Health-Conscious Consumers',
    geographicArea: { '@type': 'Place', name: 'European Union' },
  },
  isPartOf: { '@id': WEBSITE_ID() },
  hasWarranty: { '@id': WARRANTY_PROMISE_ID() },
  potentialAction: [
    {
      '@type': 'AskAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/contact?tech=${path.replace(/^\/product\//, '')}`,
        actionPlatform: 'https://schema.org/DesktopWebPlatform',
      },
      name: 'Ask Hylono support about this modality',
    },
  ],
  ...(model ? { model } : {}),
  ...(imageUrl
    ? {
        image: {
          '@type': 'ImageObject',
          url: `${SITE_URL}${imageUrl}`,
          caption: name,
          name,
          width: 1200,
          height: 800,
        },
      }
    : {}),
  ...(technicalSpecs && technicalSpecs.length > 0
    ? {
        additionalProperty: technicalSpecs.map((spec) => ({
          '@type': 'PropertyValue',
          name: spec.label,
          value: spec.value,
        })),
      }
    : {}),
  ...(similarProductPaths && similarProductPaths.length > 0
    ? {
        isSimilarTo: similarProductPaths.map((p) => ({
          '@type': 'Product',
          '@id': `${SITE_URL}${p}#product`,
          url: `${SITE_URL}${p}`,
        })),
      }
    : {}),
});

/**
 * Creates schema.org FAQPage markup scoped to a secondary product or orientation route.
 */
export const createSecondaryRouteFaqSchema = (
  items: FaqSchemaItem[],
  path: string,
  name?: string
) => createFaqSchema(items, path, name);

export interface SecondaryMedicalWebPageOptions {
  name: string;
  description: string;
  path: string;
  abstract?: string;
  about?: string[];
  citations?: CitationItem[];
  lastReviewed?: string;
  reviewedByName?: string;
  speakableSelectors?: string[];
  dateModified?: string;
}

/**
 * Creates schema.org MedicalWebPage markup for secondary modality guides, health aspect documentation,
 * and scientific evidence reviews without making clinical or diagnostic claims.
 */
export const createSecondaryMedicalWebPageSchema = ({
  name,
  description,
  path,
  abstract,
  about,
  citations,
  lastReviewed,
  reviewedByName = 'Hylono Research Review',
  speakableSelectors,
  dateModified,
}: SecondaryMedicalWebPageOptions) =>
  createMedicalWebPageSchema({
    name,
    description,
    path,
    abstract,
    about,
    citations,
    lastReviewed,
    reviewedByName,
    speakableSelectors,
    dateModified,
  });

