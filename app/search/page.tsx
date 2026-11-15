import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import { BLOG_POSTS } from '@/constants/content';
import { conditionGoals } from '@/content/conditions';
import { siteEntity } from '@/content/site-entity';
import { toBlogSlug } from '@/lib/blog';
import { protocols } from '@/content/protocols';
import { createBreadcrumbSchema, createWebPageSchema } from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { TECH_DETAILS } from '@/constants';
import { buildSearchContactHref } from '@/lib/contact-prefill';
import {
  getPublicProductRouteDescription,
  getTechRouteSlug,
} from '@/lib/product-routes';
import { SearchRouteActionStatus, SearchTrackedLink } from './SearchTrackedLink';

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

type SearchResult = {
  description: string;
  href: string;
  title: string;
  type: 'article' | 'condition' | 'product' | 'protocol';
};

const SEARCH_SUBMIT_STATUS_ID = 'search-submit-status';
const SEARCH_SUBMIT_STATUS_LABEL = 'Search utility submit status';

const strongerStartLinks = [
  {
    description: 'Browse goal-led pages if you are still deciding what kind of support fits best.',
    href: '/conditions',
    title: 'Condition guides',
  },
  {
    description: 'Review cited studies and limits before treating search as the main discovery path.',
    href: '/research',
    title: 'Research hub',
  },
  {
    description: 'Compare structured weekly routines when your next question is implementation.',
    href: '/protocols',
    title: 'Protocol library',
  },
  {
    description: 'Use the category hubs when you already know the modality you want to compare.',
    href: '/store',
    title: 'Store hub',
  },
  {
    description: 'Open support and policy guidance when the question is operational rather than exploratory.',
    href: '/help',
    title: 'Help center',
  },
] as const;

const suggestedSearches = ['HBOT', 'hydrogen', 'recovery', 'sleep', 'protocol'] as const;

const surfacePanelClass =
  'rounded-lg border border-[rgba(215,255,243,0.12)] bg-[rgba(215,255,243,0.06)] shadow-[0_18px_60px_rgba(0,0,0,0.26)] backdrop-blur';
const eyebrowClass = 'text-xs font-semibold uppercase tracking-[0.28em] text-[#7ee7cf]';
const mutedTextClass = 'text-[#a8bbb7]';
const routeLinkClass =
  'font-semibold text-[#9cf4db] underline decoration-[#69e7ce]/70 underline-offset-4 transition hover:text-[#d6fff6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7ee7cf]';

const normalizeText = (value: string): string => value.toLowerCase().trim();

const uniqueResults = (results: SearchResult[]): SearchResult[] => {
  const seen = new Set<string>();

  return results.filter((result) => {
    if (seen.has(result.href)) {
      return false;
    }

    seen.add(result.href);
    return true;
  });
};

const getSearchResults = (query: string): SearchResult[] => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return [];
  }

  const articleResults: SearchResult[] = BLOG_POSTS.filter((post) =>
    normalizeText(
      `${post.title} ${post.excerpt} ${post.category} ${post.answerSummary} ${post.audience} ${post.keyTakeaways.join(' ')} ${post.relatedConditionSlugs.join(' ')}`
    ).includes(normalizedQuery)
  ).map((post) => ({
    title: post.title,
    description: post.answerSummary,
    href: `/blog/${toBlogSlug(post.title)}`,
    type: 'article',
  }));

  const conditionResults: SearchResult[] = conditionGoals.filter((goal) =>
    normalizeText(`${goal.title} ${goal.subtitle} ${goal.description.join(' ')}`).includes(normalizedQuery)
  ).map((goal) => ({
    title: `${goal.title} wellness guide`,
    description: goal.subtitle,
    href: `/conditions/${goal.slug}`,
    type: 'condition',
  }));

  const protocolResults: SearchResult[] = protocols.filter((protocol) =>
    normalizeText(`${protocol.title} ${protocol.shortDescription} ${protocol.goal} ${protocol.targetAudience}`).includes(normalizedQuery)
  ).map((protocol) => ({
    title: protocol.title,
    description: protocol.shortDescription,
    href: `/protocols/${protocol.slug}`,
    type: 'protocol',
  }));

  const productResults: SearchResult[] = Object.values(TECH_DETAILS)
    .map((tech) => {
      const slug = getTechRouteSlug(tech.id);
      const publicDescription = getPublicProductRouteDescription({
        fallbackDescription: tech.descriptionStandard,
        productName: tech.name,
        slug,
      });

      return {
        searchText: `${tech.name} ${tech.friendlyName} ${tech.tagline} ${publicDescription}`,
        result: {
          title: `Hylono ${tech.name}`,
          description: publicDescription,
          href: `/product/${slug}`,
          type: 'product' as const,
        },
      };
    })
    .filter(({ searchText }) => normalizeText(searchText).includes(normalizedQuery))
    .map(({ result }) => result);

  return uniqueResults([
    ...productResults,
    ...conditionResults,
    ...protocolResults,
    ...articleResults,
  ]);
};

export const metadata: Metadata = createPageMetadata({
  title: 'Search Utility | Hylono page finder',
  description:
    'Use the internal Hylono search utility to jump to published products, protocols, condition guides, and articles without treating search as a primary landing page.',
  path: '/search',
  forceNoIndex: true,
});

// [DECISION: SSG because this is a public noindex utility route that should help users find existing pages without competing in the primary discovery graph.]
// Rendering strategy: server-rendered internal search utility with query-param filtering, stronger-page guidance, and a search-aware support handoff.
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const query = q.trim();
  const results = getSearchResults(query);
  const searchStatusMessage = query
    ? `${results.length} ${results.length === 1 ? 'result' : 'results'} ready for "${query}".`
    : 'Ready to search published Hylono pages.';
  const contactHref = buildSearchContactHref({
    searchQuery: query || undefined,
  });
  const webPageSchema = createWebPageSchema({
    name: 'Search Utility',
    description:
      'Use the internal Hylono search utility to jump to published products, protocols, condition guides, and articles without treating search as a primary landing page.',
    path: '/search',
  });
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
  ]);

  return (
    <>
      <StructuredData id="jsonld-search-page" data={webPageSchema} />
      <StructuredData id="jsonld-search-breadcrumb" data={breadcrumbSchema} />
      <section
        className="bg-[#050b10] px-6 pb-14 pt-36 text-[#eaf8f5] sm:py-16"
        data-search-route="true"
      >
        <div className="mx-auto max-w-5xl">
        <SearchRouteActionStatus />
        <header className="max-w-3xl">
          <p className={eyebrowClass}>Search utility</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#f4fffb]">
            Search the published Hylono pages
          </h1>
          <p className={`mt-4 text-base leading-7 ${mutedTextClass}`}>
            Use search when you already know the product category, protocol theme, goal, or article
            topic. If the question is still broad, start with the stronger pages below instead of
            treating search as the main discovery page.
          </p>
        </header>

        <div className={`${surfacePanelClass} mt-8 p-3 sm:p-4`}>
          <form
            action="/search"
            aria-describedby={SEARCH_SUBMIT_STATUS_ID}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="search-query" className="sr-only">
              Search query
            </label>
            <input
              id="search-query"
              name="q"
              defaultValue={query}
              placeholder="Search products, protocols, or articles"
              aria-describedby={SEARCH_SUBMIT_STATUS_ID}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-[rgba(215,255,243,0.16)] bg-[#07151b] px-4 py-3 text-base text-[#f3fffb] outline-none transition placeholder:text-[#78918b] focus-visible:border-[#7ee7cf] focus-visible:ring-2 focus-visible:ring-[#7ee7cf]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b10]"
              type="search"
            />
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#9cf4db] px-5 py-3 text-sm font-semibold text-[#041310] transition hover:bg-[#c9fff3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7ee7cf]"
              type="submit"
              aria-describedby={SEARCH_SUBMIT_STATUS_ID}
            >
              Search
            </button>
            <p
              id={SEARCH_SUBMIT_STATUS_ID}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={SEARCH_SUBMIT_STATUS_LABEL}
              className="sr-only"
            >
              {searchStatusMessage}
            </p>
          </form>
        </div>

        <div
          className={`${surfacePanelClass} mt-4 flex flex-wrap items-center gap-3 p-4 text-sm ${mutedTextClass}`}
        >
          <span>
            Support coverage: {siteEntity.serviceArea} | {siteEntity.supportHours}
          </span>
          <SearchTrackedLink
            className={routeLinkClass}
            eventName="search_route_cta_clicked"
            ctaRole="supporting"
            href={contactHref}
            source="support_handoff"
          >
            Contact Hylono about this search
          </SearchTrackedLink>
        </div>

        {query ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[#f4fffb]">
              {results.length} result{results.length === 1 ? '' : 's'} for "{query}"
            </h2>
            {results.length > 0 ? (
              <ul className="mt-6 space-y-4">
                {results.map((result) => (
                  <li key={result.href} className={`${surfacePanelClass} p-5`}>
                    <p className={eyebrowClass}>{result.type}</p>
                    <SearchTrackedLink
                      className="mt-2 block text-xl font-semibold text-[#f2fffb] transition hover:text-[#9cf4db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7ee7cf]"
                      eventName="search_result_clicked"
                      ctaRole="result"
                      href={result.href}
                      source="result_list"
                    >
                      {result.title}
                    </SearchTrackedLink>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                      {result.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={`${surfacePanelClass} mt-4 space-y-3 p-5`}>
                <p className={`text-sm leading-6 ${mutedTextClass}`}>
                  No direct matches were found. Try a product name, goal, protocol theme, or
                  article topic.
                </p>
                <p className={`text-sm leading-6 ${mutedTextClass}`}>
                  If the next step is still unclear,{' '}
                  <SearchTrackedLink
                    className={routeLinkClass}
                    eventName="search_route_cta_clicked"
                    ctaRole="supporting"
                    href={contactHref}
                    source="support_handoff"
                  >
                    contact Hylono about this search
                  </SearchTrackedLink>{' '}
                  so support can point you to the strongest next page.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className={`${surfacePanelClass} mt-10 p-6`}>
            <h2 className="text-lg font-semibold text-[#f4fffb]">Common search topics</h2>
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {suggestedSearches.map((example) => (
                <li key={example}>
                  <SearchTrackedLink
                    className="inline-flex min-h-10 items-center rounded-md border border-[#7ee7cf]/35 bg-[#09251f] px-3 py-2 text-[#d9fff5] transition hover:bg-[#10362e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7ee7cf]"
                    eventName="search_route_transition_clicked"
                    ctaRole="contextual"
                    href={`/search?q=${encodeURIComponent(example)}`}
                    source="suggested_search"
                  >
                    {example}
                  </SearchTrackedLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={`${surfacePanelClass} mt-10 p-6`}>
          <div className="max-w-2xl">
            <p className={eyebrowClass}>Stronger starting points</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#f4fffb]">
              Prefer a stronger starting point when the question is still broad
            </h2>
            <p className={`mt-3 text-sm leading-6 ${mutedTextClass}`}>
              Search is a secondary utility. Use the canonical guides, research, protocol, store,
              or support pages when you still need help narrowing the right page.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {strongerStartLinks.map((link) => (
              <article
                key={link.href}
                className="rounded-lg border border-[rgba(215,255,243,0.12)] bg-[#07141a]/85 p-4"
              >
                <h3 className="text-base font-semibold text-[#f2fffb]">{link.title}</h3>
                <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                  {link.description}
                </p>
                <SearchTrackedLink
                  className={`mt-3 inline-flex text-sm ${routeLinkClass}`}
                  eventName="search_route_transition_clicked"
                  ctaRole="supporting"
                  href={link.href}
                  source="stronger_start"
                >
                  Open {link.title.toLowerCase()}
                </SearchTrackedLink>
              </article>
            ))}
          </div>
        </section>
        </div>
      </section>
    </>
  );
}
