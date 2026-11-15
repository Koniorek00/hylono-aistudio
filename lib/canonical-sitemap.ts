import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/constants/content';
import { conditionGoals } from '@/content/conditions';
import { getHydrogenPremiumPath, hydrogenPremiumPages } from '@/content/hydrogen-premium-2026';
import { getApprovedProductMediaPathForPublicUse } from '@/content/product-media-assets';
import { protocols } from '@/content/protocols';
import { env } from '@/lib/env';
import { getBlogReviewedIsoDate, toBlogSlug } from '@/lib/blog';
import { getIndexableTechRouteSlugs } from '@/lib/product-routes';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

// Content baseline date: reflects the most recent substantive schema and content update.
const CONTENT_BASELINE_DATE = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00.000Z`);

// Image sitemap: product media candidates stay blocked until the approval register marks them safe.
const PRODUCT_IMAGE_CANDIDATES: Partial<Record<string, string[]>> = {
  hbot: ['/images/chambers/oxyhelp-chambers-hero.jpg'],
  hydrogen: [
    '/images/catalog/omega3/2026/pr-ho450-p.png',
    '/images/catalog/omega3/2026/pr-ho-p-family.png',
  ],
};

// Priority tiers for static routes.
const staticRouteConfig: Record<
  string,
  { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }
> = {
  '/': { changeFrequency: 'weekly', priority: 1.0 },
  '/store': { changeFrequency: 'weekly', priority: 0.9 },
  '/research': { changeFrequency: 'weekly', priority: 0.9 },
  '/rental': { changeFrequency: 'weekly', priority: 0.85 },
  '/consultation': { changeFrequency: 'weekly', priority: 0.85 },
  '/compare/rent-vs-buy': { changeFrequency: 'monthly', priority: 0.8 },
  '/how-hylono-works': { changeFrequency: 'monthly', priority: 0.82 },
  '/for-home': { changeFrequency: 'monthly', priority: 0.82 },
  '/for-professionals': { changeFrequency: 'monthly', priority: 0.82 },
  '/blog': { changeFrequency: 'weekly', priority: 0.8 },
  '/conditions': { changeFrequency: 'monthly', priority: 0.8 },
  '/protocols': { changeFrequency: 'monthly', priority: 0.8 },
  '/faq': { changeFrequency: 'monthly', priority: 0.7 },
  '/safety-and-standards': { changeFrequency: 'monthly', priority: 0.65 },
  '/service-and-support': { changeFrequency: 'monthly', priority: 0.65 },
  '/delivery-installation-onboarding': { changeFrequency: 'monthly', priority: 0.65 },
  '/about': { changeFrequency: 'monthly', priority: 0.6 },
  '/contact': { changeFrequency: 'monthly', priority: 0.6 },
  '/help': { changeFrequency: 'monthly', priority: 0.6 },
  '/sitemap': { changeFrequency: 'monthly', priority: 0.55 },
  '/returns': { changeFrequency: 'monthly', priority: 0.5 },
  '/shipping': { changeFrequency: 'monthly', priority: 0.5 },
  '/warranty': { changeFrequency: 'monthly', priority: 0.5 },
  '/policies': { changeFrequency: 'yearly', priority: 0.35 },
  '/privacy': { changeFrequency: 'yearly', priority: 0.3 },
  '/terms': { changeFrequency: 'yearly', priority: 0.3 },
  '/cookie-policy': { changeFrequency: 'yearly', priority: 0.3 },
};

const staticRoutes = Object.keys(staticRouteConfig) as (keyof typeof staticRouteConfig)[];

export const getCanonicalSitemapPath = (entry: MetadataRoute.Sitemap[number]): string =>
  new URL(entry.url).pathname.replace(/\/$/, '') || '/';

const toApprovedSitemapImages = (route: string, imagePaths: readonly string[]): string[] =>
  imagePaths
    .map((imagePath) =>
      getApprovedProductMediaPathForPublicUse({
        consumer: 'sitemap_image',
        imagePath,
        route,
      })
    )
    .filter((imagePath): imagePath is string => Boolean(imagePath))
    .map((imagePath) => `${SITE_URL}${imagePath}`);

export function getCanonicalSitemapEntries(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => {
    const config = staticRouteConfig[path]!;
    return {
      url: `${SITE_URL}${path}`,
      lastModified: CONTENT_BASELINE_DATE,
      changeFrequency: config.changeFrequency,
      priority: config.priority,
    };
  });

  const productEntries: MetadataRoute.Sitemap = getIndexableTechRouteSlugs().map((techSlug) => {
    const route = `/product/${techSlug}`;
    const images = toApprovedSitemapImages(route, PRODUCT_IMAGE_CANDIDATES[techSlug] ?? []);

    return {
      url: `${SITE_URL}${route}`,
      lastModified: CONTENT_BASELINE_DATE,
      changeFrequency: 'weekly',
      priority: 0.8,
      ...(images.length > 0 ? { images } : {}),
    };
  });

  const premiumHydrogenEntries: MetadataRoute.Sitemap = hydrogenPremiumPages.map((page) => {
    const route = getHydrogenPremiumPath(page.slug);
    const images = toApprovedSitemapImages(route, [page.image]);

    return {
      url: `${SITE_URL}${route}`,
      lastModified: CONTENT_BASELINE_DATE,
      changeFrequency: 'weekly',
      priority: 0.78,
      ...(images.length > 0 ? { images } : {}),
    };
  });

  const conditionEntries: MetadataRoute.Sitemap = conditionGoals.map((goal) => ({
    url: `${SITE_URL}/conditions/${goal.slug}`,
    lastModified: CONTENT_BASELINE_DATE,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const protocolEntries: MetadataRoute.Sitemap = protocols.map((protocol) => ({
    url: `${SITE_URL}/protocols/${protocol.slug}`,
    lastModified: CONTENT_BASELINE_DATE,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => {
    const reviewedDate = getBlogReviewedIsoDate(post);
    return {
      url: `${SITE_URL}/blog/${toBlogSlug(post.title)}`,
      lastModified: reviewedDate ? new Date(reviewedDate) : CONTENT_BASELINE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  });

  return [
    ...staticEntries,
    ...productEntries,
    ...premiumHydrogenEntries,
    ...conditionEntries,
    ...protocolEntries,
    ...blogEntries,
  ];
}
