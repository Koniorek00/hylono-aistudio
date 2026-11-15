import type { Metadata } from 'next';
import { PRICE_BOOK_CURRENCY } from '@/lib/money';
import { TechType } from '@/types';
import { TECH_DETAILS } from '@/constants';
import { BLOG_POSTS } from '@/constants/content';
import { getApprovedProductMediaPathForPublicUse } from '@/content/product-media-assets';
import { getProductForRouteSlug, getSchemaAvailabilityForProduct } from '@/content/products';
import { getProductTopicalLinks } from '@/content/topical-graph';
import { toBlogSlug } from '@/lib/blog';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createFaqSchema,
  createProductSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import { getAllTechRouteSlugs, getTechTypeFromRouteSlug } from '@/lib/product-routes';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const HBOT_TECH = TECH_DETAILS[TechType.HBOT];
const PRODUCT_NAME = `Hylono ${HBOT_TECH.name}`;
const PRODUCT_OG_IMAGE = '/images/chambers/oxyhelp-chambers-hero.jpg';
export const HBOT_SOURCE_SLUG = 'hbot';
export const HBOT2_SLUG = 'hbot2';
export const HBOT2_PATH = `/product/${HBOT2_SLUG}`;
export const HBOT2_TITLE = `${HBOT_TECH.name} | Pricing, Rental Plans, Specs and Evidence`;
export const HBOT2_DESCRIPTION =
  `Compare ${PRODUCT_NAME} pricing, rental options, technical specifications, delivery policies, and protocol guidance.`;
const APPROVED_PRODUCT_OG_IMAGE = getApprovedProductMediaPathForPublicUse({
  consumer: 'og',
  imagePath: PRODUCT_OG_IMAGE,
  route: HBOT2_PATH,
});
const APPROVED_PRODUCT_SCHEMA_IMAGE = getApprovedProductMediaPathForPublicUse({
  consumer: 'schema',
  imagePath: PRODUCT_OG_IMAGE,
  route: HBOT2_PATH,
});
const PRODUCT_CATEGORY_MAP: Record<string, string> = {
  hbot: 'HBOT',
  pemf: 'PEMF',
  rlt: 'RLT',
  hydrogen: 'Hydrogen',
};

export const hbot2Metadata: Metadata = createPageMetadata({
  title: HBOT2_TITLE,
  description: HBOT2_DESCRIPTION,
  path: HBOT2_PATH,
  forceNoIndex: true,
  ...(APPROVED_PRODUCT_OG_IMAGE
    ? {
        ogImagePath: APPROVED_PRODUCT_OG_IMAGE,
        ogImageAlt: `Hylono ${HBOT_TECH.name} wellness technology device`,
      }
    : {}),
});

export function buildHbot2StructuredData() {
  const topicalGraphLinks = getProductTopicalLinks(HBOT_SOURCE_SLUG).map(
    (link) => `${SITE_URL}${link.href}`
  );
  const similarProductSlugs = getAllTechRouteSlugs().filter((slug) => slug !== HBOT_SOURCE_SLUG);
  const canonicalProduct = getProductForRouteSlug(HBOT_SOURCE_SLUG);
  const priceValue = canonicalProduct?.purchasePrice;
  // Was the literal 'EUR' while `purchasePrice` is a price-book figure denominated
  // in PLN, so Google was told EUR 24900 for a device the checkout charges in zloty.
  // A price/currency mismatch between structured data and the visible page is a
  // rich-result violation as well as a false claim, so it is sourced, not typed.
  const priceCurrency = PRICE_BOOK_CURRENCY;
  const schemaAvailability = getSchemaAvailabilityForProduct(canonicalProduct);
  const conditionTagMap: Record<string, string | undefined> = {
    recovery: 'recovery',
    sleep: 'sleep',
    pain: 'comfort',
    stress: 'stress',
    vitality: 'vitality',
  };
  const conditionMentions = (HBOT_TECH.goalTags ?? [])
    .map((tag) => conditionTagMap[tag])
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({
      '@type': 'WebPage',
      '@id': `${SITE_URL}/conditions/${slug}`,
      url: `${SITE_URL}/conditions/${slug}`,
      name: `${slug.charAt(0).toUpperCase()}${slug.slice(1)} Wellness Guide`,
      about: {
        '@type': 'DefinedTerm',
        '@id': `${SITE_URL}/conditions/${slug}#term`,
        name: `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`,
        url: `${SITE_URL}/conditions/${slug}`,
        inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
      },
    }));
  const blogCategory = PRODUCT_CATEGORY_MAP[HBOT_SOURCE_SLUG];
  const relatedPosts = BLOG_POSTS.filter((post) => post.category === blogCategory);

  const productSchema = {
    ...createProductSchema({
      name: PRODUCT_NAME,
      description: HBOT2_DESCRIPTION,
      path: HBOT2_PATH,
      price: priceValue,
      priceCurrency,
      availability: schemaAvailability,
      imageUrl: APPROVED_PRODUCT_SCHEMA_IMAGE,
    }),
    ...(HBOT_TECH.technicalSpecs && HBOT_TECH.technicalSpecs.length > 0
      ? {
          additionalProperty: HBOT_TECH.technicalSpecs.map((spec) => ({
            '@type': 'PropertyValue',
            name: spec.label,
            value: spec.value,
          })),
        }
      : {}),
    ...(HBOT_TECH.friendlyName ? { model: HBOT_TECH.friendlyName } : {}),
    ...(similarProductSlugs.length > 0
      ? {
          isSimilarTo: similarProductSlugs.map((slug) => {
            const techType = getTechTypeFromRouteSlug(slug);
            const similarName = techType
              ? `Hylono ${TECH_DETAILS[techType].name}`
              : `Hylono ${slug.toUpperCase()}`;
            return {
              '@type': 'Product',
              '@id': `${SITE_URL}/product/${slug}#product`,
              name: similarName,
              url: `${SITE_URL}/product/${slug}`,
            };
          }),
        }
      : {}),
    ...(relatedPosts.length > 0
      ? {
          subjectOf: relatedPosts.map((post) => ({
            '@type': 'BlogPosting',
            '@id': `${SITE_URL}/blog/${toBlogSlug(post.title)}#article`,
            url: `${SITE_URL}/blog/${toBlogSlug(post.title)}`,
            headline: post.title,
          })),
        }
      : {}),
  };

  const webPageSchema = {
    ...createWebPageSchema({
      name: PRODUCT_NAME,
      description: HBOT2_DESCRIPTION,
      path: HBOT2_PATH,
      dateModified: SCHEMA_DATE_MODIFIED,
      imageUrl: APPROVED_PRODUCT_SCHEMA_IMAGE,
    }),
    '@type': 'ItemPage',
    about: [
      {
        '@type': 'Product',
        '@id': `${SITE_URL}${HBOT2_PATH}#product`,
        name: PRODUCT_NAME,
      },
      ...(HBOT_TECH.goalTags ?? [])
        .map((tag) => conditionTagMap[tag])
        .filter((slug): slug is string => Boolean(slug))
        .map((slug) => ({
          '@type': 'DefinedTerm',
          '@id': `${SITE_URL}/conditions/${slug}#term`,
          name: `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`,
          url: `${SITE_URL}/conditions/${slug}`,
          inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
        })),
    ],
    mainEntity: { '@id': `${SITE_URL}${HBOT2_PATH}#product` },
    keywords: [PRODUCT_NAME, ...(HBOT_TECH.goalTags ?? [])].join(', '),
    ...(conditionMentions.length > 0 ? { mentions: conditionMentions } : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#product-hero'],
    },
    relatedLink: topicalGraphLinks,
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: PRODUCT_NAME, path: HBOT2_PATH },
  ]);

  const productFaqItems = (HBOT_TECH.faqs ?? []).map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  const faqSchema =
    productFaqItems.length > 0
      ? createFaqSchema(productFaqItems, HBOT2_PATH, `${PRODUCT_NAME} FAQ`)
      : null;

  return {
    webPageSchema,
    productSchema,
    breadcrumbSchema,
    faqSchema,
  };
}
