import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { BlogArticle } from '@/components/BlogArticle';
import { conditionGoals } from '@/content/conditions';
import { evidenceById } from '@/content/evidence';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  createBlogPostingSchema,
  createBreadcrumbSchema,
  SCHEMA_DATE_MODIFIED,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import {
  getBlogPostBySlug,
  getBlogPublishedIsoDate,
  getBlogReviewedIsoDate,
  toBlogSlug,
} from '@/lib/blog';
import { siteOwnership } from '@/content/site-entity';
import { BLOG_POSTS, type BlogPost, type BlogProductRoute } from '@/constants/content';
import { TECH_DETAILS } from '@/constants';
import { getTechTypeFromRouteSlug } from '@/lib/product-routes';

const CONDITION_LABELS = conditionGoals.reduce<Record<string, string>>((acc, goal) => {
  acc[goal.slug] = goal.title;
  return acc;
}, {});

const resolveBlogSlug = (rawSlug: string): string => {
  const canonicalSlug = rawSlug.toLowerCase();
  if (rawSlug !== canonicalSlug && getBlogPostBySlug(canonicalSlug)) {
    permanentRedirect(`/blog/${canonicalSlug}`);
  }

  return canonicalSlug;
};

const getArticleProductRoutes = (article: BlogPost): BlogProductRoute[] =>
  Array.from(new Set([
    ...(article.relatedProductRoutes ?? []),
    ...(article.relatedProductRoute ? [article.relatedProductRoute] : []),
  ]));

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: toBlogSlug(post.title),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = resolveBlogSlug(rawSlug);
  const article = getBlogPostBySlug(slug);

  if (!article) {
    notFound();
  }

  const baseMeta = createPageMetadata({
    title: `${article.title} | Hylono Blog`,
    description: article.excerpt,
    path: `/blog/${slug}`,
    ogType: 'article',
  });
  const datePublished = getBlogPublishedIsoDate(article.date) ?? undefined;
  const dateReviewed = getBlogReviewedIsoDate(article) ?? datePublished;

  return {
    ...baseMeta,
    openGraph: {
      ...baseMeta.openGraph,
      type: 'article',
      ...(datePublished ? { publishedTime: datePublished } : {}),
      ...(dateReviewed ? { modifiedTime: dateReviewed } : {}),
      section: article.category,
      tags: [article.category, ...article.relatedConditionSlugs],
      authors: [siteOwnership.editorial.team],
    } as Metadata['openGraph'],
  };
}

// [DECISION: ISR because article content is semi-dynamic and should refresh on a timed cadence.]
// Rendering strategy: server-rendered article page with crawlable section content, visible review context, and internal next-step links.
export default async function BlogArticlePageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = resolveBlogSlug(rawSlug);
  const article = getBlogPostBySlug(slug);

  if (!article) {
    notFound();
  }

  const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
  const datePublished = getBlogPublishedIsoDate(article.date) ?? `${SCHEMA_DATE_MODIFIED}T00:00:00.000Z`;
  const dateReviewed = getBlogReviewedIsoDate(article) ?? datePublished;
  const readTimeMinutes = parseInt(article.readTime, 10);
  const estimatedWordCount = readTimeMinutes > 0 ? readTimeMinutes * 200 : undefined;
  const blogProductRouteSlugs = getArticleProductRoutes(article);
  const productEntities = blogProductRouteSlugs.map((routeSlug) => {
    const techType = getTechTypeFromRouteSlug(routeSlug);
    const productName = techType
      ? `Hylono ${TECH_DETAILS[techType].name}`
      : `Hylono ${routeSlug}`;

    return {
      '@type': 'Product',
      '@id': `${SITE_URL}/product/${routeSlug}#product`,
      url: `${SITE_URL}/product/${routeSlug}`,
      name: productName,
    };
  });
  const productNames = productEntities.map((entity) => entity.name);
  const isTechArticle = productEntities.length > 0;
  const citationItems = article.evidenceIds
    .map((id) => evidenceById[id])
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const citationSchemas = citationItems.map((citation) => ({
    '@type': 'ScholarlyArticle',
    '@id': citation.doi ? `https://doi.org/${citation.doi}` : citation.sourceUrl,
    headline: citation.title,
    url: citation.sourceUrl,
    ...(citation.year ? { datePublished: citation.year.toString() } : {}),
    ...(citation.authors ? { author: { '@type': 'Person', name: citation.authors } } : {}),
    ...(citation.doi
      ? { identifier: { '@type': 'PropertyValue', propertyID: 'doi', value: citation.doi } }
      : {}),
  }));
  const aboutTerms = [
    article.category,
    ...article.relatedConditionSlugs.map((slug) => CONDITION_LABELS[slug] ?? slug),
  ];
  const articleSchema = {
    ...createBlogPostingSchema({
      headline: article.title,
      description: article.excerpt,
      path: `/blog/${slug}`,
      datePublished,
      dateModified: dateReviewed,
      articleSection: article.category,
      authorName: siteOwnership.editorial.team,
      wordCount: estimatedWordCount,
    }),
    ...(isTechArticle ? { '@type': ['BlogPosting', 'TechArticle'] } : {}),
    ...(productEntities.length > 0
      ? { about: productEntities.length === 1 ? productEntities[0] : productEntities }
      : {}),
    keywords: [article.category, ...article.relatedConditionSlugs, ...productNames].join(', '),
    ...(productEntities.length > 0
      ? {
          mentions: productEntities.length === 1 ? productEntities[0] : productEntities,
        }
      : {}),
    ...(readTimeMinutes > 0 ? { timeRequired: `PT${readTimeMinutes}M` } : {}),
    ...(citationSchemas.length > 0 ? { citation: citationSchemas } : {}),
    isPartOf: { '@type': 'CollectionPage', '@id': `${SITE_URL}/blog`, url: `${SITE_URL}/blog` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#article-reader-title', '#article-reader-excerpt'],
    },
  };
  const articlePath = `/blog/${slug}`;
  const relatedLinks = [
    `${SITE_URL}/blog`,
    `${SITE_URL}/research`,
    `${SITE_URL}/protocols`,
    `${SITE_URL}/contact`,
    ...article.relatedConditionSlugs.map((conditionSlug) => `${SITE_URL}/conditions/${conditionSlug}`),
    ...blogProductRouteSlugs.map((routeSlug) => `${SITE_URL}/product/${routeSlug}`),
  ].filter((value, index, array) => array.indexOf(value) === index);
  const aboutEntities = [
    ...productEntities,
    ...aboutTerms.map((term) => ({
      '@type': 'DefinedTerm',
      name: term,
    })),
  ];
  const webPageSchema = {
    ...createWebPageSchema({
      name: article.title,
      description: article.excerpt,
      path: articlePath,
      dateModified: dateReviewed,
    }),
    datePublished,
    mainEntity: { '@id': `${SITE_URL}${articlePath}#article` },
    about: aboutEntities,
    ...(citationSchemas.length > 0 ? { citation: citationSchemas } : {}),
    reviewedBy: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID(),
      name: siteOwnership.research.team,
      url: `${SITE_URL}/about`,
    },
    ...(productEntities.length > 0
      ? {
          mentions: productEntities.length === 1 ? productEntities[0] : productEntities,
        }
      : {}),
    relatedLink: relatedLinks,
    lastReviewed: dateReviewed,
    isPartOf: { '@id': `${SITE_URL}/blog` },
  };
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: article.title, path: `/blog/${slug}` },
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-blog-post" data={articleSchema} />
        <StructuredData id="jsonld-blog-page" data={webPageSchema} />
        <StructuredData id="jsonld-blog-breadcrumb" data={breadcrumbSchema} />
      </Suspense>
      <BlogArticle article={article} />
    </>
  );
}
