// Canonical public identity for the Hylono website.
//
// Source of truth for the legal/contact facts below is the operating business behind
// both sibling brand sites (molecular.love and hiperbarycznekomory.pl), which publish
// the same owner, postal address, and phone number. Do not add registration numbers,
// certifications, partner records, or coordinates here until they are verified.
export const siteEntity = {
  name: 'Hylono',
  legalName: 'Omega-3 Jerzy Trojanek',
  ownerName: 'Jerzy Trojanek',
  description:
    'Hylono is a European wellness-technology platform focused on guided device access, protocol planning, and conservative evidence-informed education.',
  supportEmail: 'support@hylono.com',
  contactEmail: 'contact@hylono.com',
  phone: '+48 607 874 746',
  phoneHref: 'tel:+48607874746',
  address: {
    streetAddress: 'ul. PCK 2B lok. 8',
    addressLocality: 'Częstochowa',
    postalCode: '42-200',
    addressCountry: 'PL',
  },
  supportHours: 'Monday to Friday, 09:00 to 18:00 CET',
  serviceArea: 'European Union',
  supportCoverageLabel: 'EU support coverage',
  // Transactional currency for published prices and checkout. Kept as a single value
  // so schema, pricing, and payment paths cannot drift apart.
  transactionCurrency: 'PLN',
  // Operational commitments published on the sibling chamber site.
  warrantySummary:
    '2-year manufacturer warranty with the option to extend by a further 3 years.',
  serviceResponseSummary:
    'Service response within 10 business days, covering remote diagnostics, video support, and voice support.',
  // Verified sibling brand properties operated by the same business. Used for honest
  // entity disambiguation, not as a merge or consolidation signal.
  siblingBrandSites: ['https://molecular.love', 'https://hiperbarycznekomory.pl'],
  trustPagePaths: [
    '/about',
    '/how-hylono-works',
    '/safety-and-standards',
    '/service-and-support',
    '/delivery-installation-onboarding',
    '/press',
    '/help',
    '/faq',
    '/contact',
    '/policies',
    '/returns',
    '/shipping',
    '/warranty',
    '/privacy',
    '/cookie-policy',
    '/terms',
  ],
} as const;

export const siteOwnership = {
  editorial: {
    label: 'Editorial oversight',
    team: 'Hylono Editorial Team',
  },
  research: {
    label: 'Evidence review',
    team: 'Hylono Research Review',
  },
  commerce: {
    label: 'Commerce support',
    team: 'Hylono Commerce & Support',
  },
} as const;
