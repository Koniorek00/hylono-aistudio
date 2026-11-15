import type { Metadata } from 'next';
import type { ConditionGoalPage } from '@/content/conditions';
import { ConditionDetailPageContent } from '@/components/ConditionDetailPageContent';
import { conditionGoalBySlug } from '@/content/conditions';
import { evidence } from '@/content/evidence';
import { protocolBySlug } from '@/content/protocols';
import { siteOwnership } from '@/content/site-entity';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  createBreadcrumbSchema,
  createFaqSchema,
  createMedicalWebPageSchema,
  SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import { env } from '@/lib/env';
import { StaticStructuredData } from '@/src/components/StaticStructuredData';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const MODALITY_SLUG_TO_PRODUCT_ROUTE: Record<string, string> = {
  HBOT: 'hbot',
  H2: 'hydrogen',
  RLT: 'rlt',
  PEMF: 'pemf',
};

const MODALITY_SLUG_TO_PRODUCT_NAME: Record<string, string> = {
  HBOT: 'Hylono HBOT',
  H2: 'Hylono Hydrogen',
  RLT: 'Hylono PBM / Red Light',
  PEMF: 'Hylono PEMF + VNS',
};

export type ConditionRouteSlug = ConditionGoalPage['slug'];

const getConditionGoal = (slug: ConditionRouteSlug) => {
  const goal = conditionGoalBySlug[slug];

  if (!goal) {
    throw new Error(`Unknown condition slug: ${slug}`);
  }

  return goal;
};

/**
 * Search engines showed five near-identical snippets for five indexable routes.
 *
 * The description used to be a single template with the goal title dropped in, so
 * /conditions/recovery and /conditions/sleep differed by ONE WORD in the result
 * Google displays. Nothing distinguished them to a searcher, and a near-duplicate
 * snippet is the kind of thing Google rewrites or collapses.
 *
 * Each goal already carries a distinct, compliance-checked `subtitle` — the same
 * text this route publishes as its schema description — and a distinct modality
 * order (recovery leads with HBOT, sleep with PEMF, stress with hydrogen). Building
 * the description from those two makes every page's snippet its own, without
 * inventing a claim: nothing here is new copy, it is the page's own content.
 *
 * The modality clause is appended only when it fits inside SERP_DESCRIPTION_LIMIT,
 * because a snippet truncated mid-list is worse than a shorter honest one.
 */
const SERP_DESCRIPTION_LIMIT = 160;

export function buildConditionDescription(goal: {
  subtitle: string;
  modalities: readonly { shortName: string }[];
}): string {
  const base = goal.subtitle.trim();
  const names = goal.modalities.map((modality) => modality.shortName);

  if (names.length === 0) {
    return base;
  }

  // Three of the five subtitles already open with "Compare", so a fixed
  // "Compare X, Y" clause produced "Compare low-friction routines... Compare H2,
  // PEMF..." - the same verb twice in one snippet. Vary the wording instead.
  const clause = /\bcompare\b/i.test(base)
    ? ` Side by side: ${names.join(', ')}.`
    : ` Compare ${names.join(', ')} side by side.`;

  return base.length + clause.length <= SERP_DESCRIPTION_LIMIT ? `${base}${clause}` : base;
}

export function createConditionDetailMetadata(slug: ConditionRouteSlug): Metadata {
  const goal = getConditionGoal(slug);

  return createPageMetadata({
    title: `${goal.title} | Technologies, Protocols and Research`,
    description: buildConditionDescription(goal),
    path: `/conditions/${slug}`,
  });
}

export function ConditionDetailPage({
  slug,
}: {
  slug: ConditionRouteSlug;
}) {
  const goal = getConditionGoal(slug);
  const faqItems = goal.faq.map((item) => ({
    answer: item.a,
    question: item.q,
  }));
  const conditionTermSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${SITE_URL}/conditions/${slug}#term`,
    name: goal.title,
    description: goal.subtitle,
    url: `${SITE_URL}/conditions/${slug}`,
    inLanguage: 'en',
    inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
    termCode: goal.slug,
    subjectOf: goal.modalities.map((modality) => {
      const productSlug = MODALITY_SLUG_TO_PRODUCT_ROUTE[modality.slug];
      return {
        '@type': 'DefinedTerm',
        name: modality.name,
        ...(productSlug
          ? {
              url: `${SITE_URL}/product/${productSlug}`,
            }
          : {}),
      };
    }),
  };
  const conditionWebPageSchema = createMedicalWebPageSchema({
    name: `${goal.title} Wellness Guide`,
    description: goal.subtitle,
    abstract: goal.subtitle,
    path: `/conditions/${slug}`,
    about: [goal.title, ...goal.modalities.map((modality) => modality.name)],
    citations: goal.evidenceIds
      .map((id) => evidence.find((item) => item.id === id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        title: item.title,
        url: item.sourceUrl,
        doi: item.doi,
        year: item.year,
        authors: item.authors,
      })),
    reviewedByName: siteOwnership.research.team,
    speakableSelectors: ['#condition-intro'],
    dateModified: SCHEMA_DATE_MODIFIED,
    lastReviewed: SCHEMA_DATE_MODIFIED,
    mainEntity: faqItems.length > 0 ? { '@id': `${SITE_URL}/conditions/${slug}#faq` } : undefined,
  });

  return (
    <>
      <StaticStructuredData id="jsonld-condition-entity" data={conditionTermSchema} />
      <StaticStructuredData
        id="jsonld-condition-page"
        data={{
          ...conditionWebPageSchema,
          about: [
            {
              '@type': 'DefinedTerm',
              '@id': `${SITE_URL}/conditions/${slug}#term`,
              name: goal.title,
              url: `${SITE_URL}/conditions/${slug}`,
              inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
            },
            ...goal.modalities.map((modality) => {
              const productSlug = MODALITY_SLUG_TO_PRODUCT_ROUTE[modality.slug];
              return productSlug
                ? {
                    '@type': 'Product',
                    '@id': `${SITE_URL}/product/${productSlug}#product`,
                    name: MODALITY_SLUG_TO_PRODUCT_NAME[modality.slug] ?? modality.name,
                    url: `${SITE_URL}/product/${productSlug}`,
                  }
                : { '@type': 'DefinedTerm', name: modality.name };
            }),
          ],
          keywords: [goal.title, ...goal.modalities.map((modality) => modality.name)].join(', '),
          audience: {
            '@type': 'Audience',
            audienceType: 'Wellness planning readers',
          },
          mentions: [
            ...goal.modalities
              .filter((modality) => Boolean(MODALITY_SLUG_TO_PRODUCT_ROUTE[modality.slug]))
              .map((modality) => {
                const routeSlug = MODALITY_SLUG_TO_PRODUCT_ROUTE[modality.slug]!;
                return {
                  '@type': 'Product',
                  '@id': `${SITE_URL}/product/${routeSlug}#product`,
                  url: `${SITE_URL}/product/${routeSlug}`,
                  name: MODALITY_SLUG_TO_PRODUCT_NAME[modality.slug] ?? `Hylono ${modality.shortName}`,
                };
              }),
            ...goal.protocolSlugs.map((protocolSlug) => ({
              '@type': 'HowTo',
              '@id': `${SITE_URL}/protocols/${protocolSlug}#howto`,
              url: `${SITE_URL}/protocols/${protocolSlug}`,
              name: protocolBySlug[protocolSlug]?.title ?? protocolSlug,
            })),
          ],
          relatedLink: [
            `${SITE_URL}/conditions`,
            `${SITE_URL}/research`,
            ...goal.protocolSlugs.map((protocolSlug) => `${SITE_URL}/protocols/${protocolSlug}`),
          ],
        }}
      />
      {faqItems.length > 0 && (
        <StaticStructuredData
          id="jsonld-condition-faq"
          data={createFaqSchema(faqItems, `/conditions/${slug}`, `${goal.title} FAQ`)}
        />
      )}
      <StaticStructuredData
        id="jsonld-condition-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Conditions', path: '/conditions' },
          { name: goal.title, path: `/conditions/${slug}` },
        ])}
      />
      <ConditionDetailPageContent slug={slug} />
    </>
  );
}
