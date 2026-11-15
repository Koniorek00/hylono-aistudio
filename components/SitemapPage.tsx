import Link from 'next/link';
import type { MetadataRoute } from 'next';
import { ArrowRight, Map } from 'lucide-react';
import { getCanonicalSitemapPath } from '@/lib/canonical-sitemap';

type SitemapEntry = MetadataRoute.Sitemap[number];

interface SitemapPageProps {
  entries: SitemapEntry[];
}

export const SITEMAP_LINK_STATUS_ID = 'sitemap-link-action-status';
export const SITEMAP_LINK_READY_STATUS = 'Sitemap links are ready.';

const formatSegment = (segment: string): string => {
  const knownLabels: Record<string, string> = {
    faq: 'FAQ',
    hbot: 'HBOT',
    pemf: 'PEMF',
    rlt: 'RLT',
    h2: 'H2',
    za: 'ZA',
    pr: 'PR',
    os: 'OS',
    wo: 'WO',
  };

  return segment
    .split('-')
    .map((part) => knownLabels[part] ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
};

const getEntryLabel = (path: string): string => {
  if (path === '/') {
    return 'Home';
  }

  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments.at(-1) ?? path;

  if (segments[0] === 'product' && segments[1]) {
    return `Product: ${formatSegment(segments.slice(1).join(' '))}`;
  }

  if (segments[0] === 'conditions' && segments[1]) {
    return `Condition: ${formatSegment(lastSegment)}`;
  }

  if (segments[0] === 'protocols' && segments[1]) {
    return `Protocol: ${formatSegment(lastSegment)}`;
  }

  if (segments[0] === 'blog' && segments[1]) {
    return `Article: ${formatSegment(lastSegment)}`;
  }

  return formatSegment(lastSegment);
};

const getEntrySection = (path: string): string => {
  if (
    path === '/' ||
    [
      '/store',
      '/rental',
      '/contact',
      '/consultation',
      '/compare/rent-vs-buy',
      '/how-hylono-works',
      '/for-home',
      '/for-professionals',
    ].includes(path)
  ) {
    return 'Core Hubs';
  }

  if (path.startsWith('/product')) {
    return 'Technology & Products';
  }

  if (
    path.startsWith('/research') ||
    path.startsWith('/protocols') ||
    path.startsWith('/blog') ||
    path.startsWith('/conditions')
  ) {
    return 'Education & Research';
  }

  if (
    [
      '/help',
      '/faq',
      '/safety-and-standards',
      '/service-and-support',
      '/delivery-installation-onboarding',
      '/shipping',
      '/returns',
      '/warranty',
      '/policies',
    ].includes(path)
  ) {
    return 'Support & Policies';
  }

  if (['/about', '/sitemap'].includes(path)) {
    return 'Company';
  }

  return 'Legal';
};

const sectionOrder = [
  'Core Hubs',
  'Technology & Products',
  'Education & Research',
  'Support & Policies',
  'Company',
  'Legal',
] as const;

const getSectionId = (title: string): string => `sitemap-${title.toLowerCase().replace(/\W+/g, '-')}`;
const getSectionDescriptionId = (title: string): string => `${getSectionId(title)}-description`;

const sortEntries = (a: SitemapEntry, b: SitemapEntry): number => {
  const priorityA = a.priority ?? 0;
  const priorityB = b.priority ?? 0;

  if (priorityA !== priorityB) {
    return priorityB - priorityA;
  }

  return getCanonicalSitemapPath(a).localeCompare(getCanonicalSitemapPath(b));
};

const groupEntries = (entries: SitemapEntry[]) =>
  sectionOrder
    .map((section) => ({
      title: section,
      entries: entries
        .filter((entry) => getEntrySection(getCanonicalSitemapPath(entry)) === section)
        .sort(sortEntries),
    }))
    .filter((section) => section.entries.length > 0);

export function SitemapPage({ entries }: SitemapPageProps) {
  const sections = groupEntries(entries);

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <Map aria-hidden="true" className="text-cyan-500" size={32} />
            <h1 className="text-4xl font-bold text-slate-900">Sitemap</h1>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            A clear directory of active Hylono pages, so product, research, support, and policy
            links stay easy to find.
          </p>
          <p
            id={SITEMAP_LINK_STATUS_ID}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label="Sitemap link action status"
            className="sr-only"
          >
            {SITEMAP_LINK_READY_STATUS}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const sectionId = getSectionId(section.title);
            const sectionDescriptionId = getSectionDescriptionId(section.title);
            const linkDescriptionIds = `${sectionDescriptionId} ${SITEMAP_LINK_STATUS_ID}`;

            return (
              <section
                key={section.title}
                aria-labelledby={sectionId}
                aria-describedby={sectionDescriptionId}
              >
                <h2
                  id={sectionId}
                  className="mb-4 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  {section.title}
                </h2>
                <p id={sectionDescriptionId} className="sr-only">
                  {section.title} sitemap links open active Hylono pages from the canonical public
                  directory.
                </p>
                <ul className="space-y-2.5">
                  {section.entries.map((entry) => {
                    const path = getCanonicalSitemapPath(entry);

                    return (
                      <li key={path}>
                        <Link
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm text-slate-600 transition-colors hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                          href={path}
                          aria-describedby={linkDescriptionIds}
                        >
                          <ArrowRight
                            aria-hidden="true"
                            className="text-slate-300 transition-colors"
                            size={11}
                          />
                          {getEntryLabel(path)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
