import { ArrowLeft, ArrowRight, Calendar, Clock, ExternalLink, Microscope, Route } from 'lucide-react';
import { conditionGoals } from '@/content/conditions';
import { evidenceById } from '@/content/evidence';
import { protocolBySlug } from '@/content/protocols';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import { toBlogSlug } from '@/lib/blog';
import { PageOwnership } from '@/components/content/PageOwnership';
import { BlogArticleRouteActionStatus, BlogTrackedLink } from '@/components/blog/BlogTrackedLink';
import { BLOG_POSTS, type BlogConditionSlug, type BlogPost, type BlogProductRoute } from '../constants/content';

const CONDITION_LABELS = conditionGoals.reduce<Record<BlogConditionSlug, string>>((acc, goal) => {
    acc[goal.slug] = goal.title;
    return acc;
}, {} as Record<BlogConditionSlug, string>);

const PRODUCT_LINKS: Record<BlogProductRoute, { href: string; label: string; description: string }> = {
    hbot: {
        href: '/product/hbot',
        label: 'HBOT hub',
        description: 'Compare the HBOT category, support context, and next-step commercial path.',
    },
    pemf: {
        href: '/product/pemf',
        label: 'PEMF hub',
        description: 'Review PEMF category fit and move from orientation into product-level context.',
    },
    rlt: {
        href: '/product/rlt',
        label: 'Red-light hub',
        description: 'Compare the red-light category once the modality itself is likely relevant.',
    },
    hydrogen: {
        href: '/product/hydrogen',
        label: 'Hydrogen hub',
        description: 'Open the hydrogen category hub for equipment context and planning details.',
    },
};

const formatReviewDate = (rawDate = SCHEMA_DATE_MODIFIED): string =>
    new Date(`${rawDate}T00:00:00Z`).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

const sharesContext = (left: BlogPost, right: BlogPost): boolean =>
    left.category === right.category ||
    left.relatedConditionSlugs.some((slug) => right.relatedConditionSlugs.includes(slug));

const getRelatedProductRoutes = (article: BlogPost): BlogProductRoute[] =>
    Array.from(new Set([
        ...(article.relatedProductRoutes ?? []),
        ...(article.relatedProductRoute ? [article.relatedProductRoute] : []),
    ]));

export function BlogArticle({ article }: { article: BlogPost }) {
    const articleSlug = toBlogSlug(article.title);
    const evidenceItems = article.evidenceIds
        .map((id) => evidenceById[id])
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
    const displayReviewDate = formatReviewDate(article.reviewedDate);
    const relatedPosts = BLOG_POSTS.filter((post) => post.id !== article.id && sharesContext(article, post)).slice(0, 3);
    const relatedProtocols = article.relatedProtocolSlugs
        .map((slug) => protocolBySlug[slug])
        .filter((protocol): protocol is NonNullable<typeof protocol> => Boolean(protocol));
    const relatedConditions = article.relatedConditionSlugs.map((slug) => ({
        href: `/conditions/${slug}`,
        label: `${CONDITION_LABELS[slug]} guide`,
        description: `See how ${CONDITION_LABELS[slug].toLowerCase()} questions connect into the wider Hylono path.`,
    }));
    const relatedProducts = getRelatedProductRoutes(article).map((route) => PRODUCT_LINKS[route]);
    const nextStepCards = [
        ...relatedConditions,
        ...relatedProducts,
        ...relatedProtocols.slice(0, 2).map((protocol) => ({
            href: `/protocols/${protocol.slug}`,
            label: protocol.title,
            description: protocol.shortDescription,
        })),
        {
            href: '/research',
            label: 'Research hub',
            description: 'Open the cited-study library when you need source context and limitations.',
        },
        {
            href: '/contact',
            label: 'Contact Hylono',
            description: 'Use support when your next step depends on schedule, fit, or stack planning.',
        },
    ].filter((item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index);
    const primaryNextStep = nextStepCards[0];
    const heroSecondaryStep =
        relatedProducts.find((product) => product.href !== primaryNextStep?.href) ?? null;

    return (
        <div className="min-h-screen bg-slate-950 pb-24 pt-10 text-white">
            <BlogArticleRouteActionStatus />
            <div className="mx-auto max-w-6xl px-6">
                <BlogTrackedLink
                    articleSlug={articleSlug}
                    category={article.category}
                    ctaRole="secondary"
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-cyan-100"
                    source="article_chrome"
                >
                    <ArrowLeft size={16} />
                    Back to blog
                </BlogTrackedLink>

                <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)] lg:items-start">
                    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]">
                        <div className={`relative overflow-hidden bg-gradient-to-br ${article.image} px-6 py-10 sm:px-8 md:px-10 md:py-12`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent" />

                            <div className="relative z-10 max-w-4xl">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                                        {article.articleType}
                                    </span>
                                    <span className="rounded-lg bg-white/12 px-3 py-1 text-xs font-bold text-white/85">
                                        {article.category}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/12 px-3 py-1 text-xs font-semibold text-white/85">
                                        {evidenceItems.length > 0 ? <Microscope size={12} /> : <Route size={12} />}
                                        {evidenceItems.length > 0 ? `${evidenceItems.length} cited records` : 'Planning article'}
                                    </span>
                                </div>

                                <h1
                                    id="article-reader-title"
                                    className="mt-6 max-w-[10ch] text-[1.7rem] font-black leading-[0.94] tracking-[-0.05em] text-white sm:max-w-[12ch] sm:text-[2.25rem] md:max-w-4xl md:text-5xl md:leading-none md:tracking-tight"
                                >
                                    {article.title}
                                </h1>

                                <p
                                    id="article-reader-excerpt"
                                    className="mt-5 max-w-3xl text-lg leading-8 text-white/80"
                                >
                                    {article.excerpt}
                                </p>

                                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70">
                                    {article.answerSummary}
                                </p>

                                {primaryNextStep ? (
                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <BlogTrackedLink
                                            articleSlug={articleSlug}
                                            category={article.category}
                                            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-[#061216] transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100"
                                            ctaRole="primary"
                                            eventName="blog_article_cta_clicked"
                                            href={primaryNextStep.href}
                                            source="hero"
                                        >
                                            Start with {primaryNextStep.label}
                                            <ArrowRight className="ml-2" size={15} />
                                        </BlogTrackedLink>
                                        {heroSecondaryStep ? (
                                            <BlogTrackedLink
                                                articleSlug={articleSlug}
                                                category={article.category}
                                                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                                ctaRole="secondary"
                                                href={heroSecondaryStep.href}
                                                source="hero"
                                            >
                                                Review {heroSecondaryStep.label}
                                            </BlogTrackedLink>
                                        ) : null}
                                    </div>
                                ) : null}

                                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/75">
                                    <span className="inline-flex items-center gap-2">
                                        <Calendar size={14} />
                                        {article.date}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <Clock size={14} />
                                        {article.readTime}
                                    </span>
                                    <span className="rounded-lg border border-white/20 px-3 py-1 text-xs font-medium text-white/85">
                                        Audience: {article.audience}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 p-8 md:p-10">
                            <div className="grid gap-4 md:grid-cols-3">
                                {article.keyTakeaways.map((takeaway) => (
                                    <div key={takeaway} className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                                        <p className="text-sm leading-7 text-slate-300">{takeaway}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <PageOwnership
                        title="Article review context"
                        description="This page is intended to help a visitor move from a shorter article read into stronger Hylono pages for research, products, protocols, or support."
                        items={[
                            {
                                label: siteOwnership.editorial.label,
                                value: siteOwnership.editorial.team,
                                detail: 'Owns article scope, messaging clarity, and visible next-step fit.',
                            },
                            {
                                label: siteOwnership.research.label,
                                value: siteOwnership.research.team,
                                detail: evidenceItems.length > 0
                                    ? 'Reviews cited-study alignment and conservative wording on evidence-linked articles.'
                                    : 'Reviews conservative wording and keeps planning guidance inside the site evidence posture.',
                            },
                            {
                                label: 'Last reviewed',
                                value: displayReviewDate,
                                detail: 'Use this page for planning and orientation, not as personalized professional advice.',
                            },
                            {
                                label: 'Support coverage',
                                value: `${siteEntity.serviceArea} | ${siteEntity.supportHours}`,
                                detail: `Need direct help? ${siteEntity.contactEmail} connects visitors with planning support.`,
                            },
                        ]}
                        actions={[
                            { href: '/about', label: 'About Hylono' },
                            { href: '/help', label: 'Support hub' },
                            { href: '/contact', label: 'Contact Hylono' },
                        ]}
                        variant="dark"
                    />
                </section>

                <section className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.7fr)]">
                    <article className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-8 md:p-10">
                        <div className="space-y-12">
                            {article.sections.map((section) => (
                                <section key={section.heading}>
                                    <h2 className="text-3xl font-black tracking-tight text-white">
                                        {section.heading}
                                    </h2>
                                    <div className="mt-5 space-y-4 text-base leading-8 text-slate-300">
                                        {section.paragraphs.map((paragraph) => (
                                            <p key={paragraph}>{paragraph}</p>
                                        ))}
                                    </div>
                                    {section.bullets?.length ? (
                                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                                            {section.bullets.map((bullet) => (
                                                <li
                                                    key={bullet}
                                                    className="rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3"
                                                >
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </section>
                            ))}
                        </div>
                    </article>

                    <div className="min-w-0 space-y-6">
                        <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                Scope and limitations
                            </p>
                            <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                                What this page should not do
                            </h2>
                            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                                {article.limitations.map((limitation) => (
                                    <li key={limitation} className="rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3">
                                        {limitation}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                Best next step
                            </p>
                            <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                                Move to the stronger page type fast
                            </h2>
                            <div className="mt-5 space-y-4">
                                {nextStepCards.map((card) => (
                                    <BlogTrackedLink
                                        articleSlug={articleSlug}
                                        category={article.category}
                                        key={card.href}
                                        href={card.href}
                                        className="block min-h-11 rounded-lg border border-white/10 bg-slate-950/55 p-4 transition-colors hover:border-cyan-300/40 hover:bg-white/[0.075] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                                        ctaRole="contextual"
                                        source="next_step_cards"
                                    >
                                        <p className="font-semibold text-white">{card.label}</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                            {card.description}
                                        </p>
                                    </BlogTrackedLink>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>

                <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-8 md:p-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                        Evidence and sourcing
                    </p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                        {evidenceItems.length > 0 ? 'Research records used on this page' : 'No direct citations on this page yet'}
                    </h2>

                    {evidenceItems.length > 0 ? (
                        <>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                                These records come from the reviewed source library and should be
                                read together with their population, endpoint, and limitation
                                context.
                            </p>
                            <div className="mt-8 grid gap-5 lg:grid-cols-2">
                                {evidenceItems.map((evidence) => (
                                    <article
                                        key={evidence.id}
                                        className="rounded-lg border border-white/10 bg-slate-950/55 p-6"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-lg bg-cyan-300 px-3 py-1 text-xs font-semibold text-[#061216]">
                                                {evidence.primaryModality}
                                            </span>
                                            <span className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-300">
                                                {evidence.studyType}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500">{evidence.year}</span>
                                        </div>

                                        <h3 className="mt-4 text-xl font-black leading-8 text-white">
                                            {evidence.title}
                                        </h3>
                                        <p className="mt-3 text-sm text-slate-500">
                                            {evidence.authors} | {evidence.publication}
                                        </p>
                                        <p className="mt-4 text-sm leading-7 text-slate-300">
                                            {evidence.resultSummary}
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                                            <BlogTrackedLink
                                                articleSlug={articleSlug}
                                                category={article.category}
                                                ctaRole="contextual"
                                                href={evidence.sourceUrl}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="inline-flex items-center gap-2 text-cyan-100 underline decoration-cyan-300/50 underline-offset-4 transition hover:decoration-cyan-100"
                                                source="evidence_panel"
                                            >
                                                Open source record
                                                <ExternalLink size={14} />
                                            </BlogTrackedLink>
                                            <BlogTrackedLink
                                                articleSlug={articleSlug}
                                                category={article.category}
                                                ctaRole="contextual"
                                                href="/research"
                                                className="text-slate-300 underline decoration-slate-500 underline-offset-4 transition hover:text-cyan-100"
                                                source="evidence_panel"
                                            >
                                                Compare in research hub
                                            </BlogTrackedLink>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
                            <div className="rounded-lg border border-white/10 bg-slate-950/55 p-6">
                                <p className="text-sm leading-7 text-slate-300">
                                    This article is intentionally positioned as a planning surface.
                                    It helps clarify the question, but it should
                                    not pretend to be a complete evidence review when the canonical
                                    evidence library for this topic is not surfaced here yet.
                                </p>
                                <p className="mt-4 text-sm leading-7 text-slate-300">
                                    If you need stronger source context before acting, open the
                                    research hub, a condition guide, or contact Hylono for a
                                    narrower recommendation path.
                                </p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                    Stronger next step
                                </p>
                                <div className="mt-4 flex flex-col gap-3 text-sm font-semibold">
                                    <BlogTrackedLink
                                        articleSlug={articleSlug}
                                        category={article.category}
                                        ctaRole="contextual"
                                        href="/research"
                                        className="text-slate-300 underline decoration-slate-500 underline-offset-4 transition hover:text-cyan-100"
                                        source="evidence_panel"
                                    >
                                        Open research
                                    </BlogTrackedLink>
                                    <BlogTrackedLink
                                        articleSlug={articleSlug}
                                        category={article.category}
                                        ctaRole="contextual"
                                        href="/conditions"
                                        className="text-slate-300 underline decoration-slate-500 underline-offset-4 transition hover:text-cyan-100"
                                        source="evidence_panel"
                                    >
                                        Browse conditions
                                    </BlogTrackedLink>
                                    <BlogTrackedLink
                                        articleSlug={articleSlug}
                                        category={article.category}
                                        ctaRole="contextual"
                                        href="/contact"
                                        className="text-slate-300 underline decoration-slate-500 underline-offset-4 transition hover:text-cyan-100"
                                        source="evidence_panel"
                                    >
                                        Ask Hylono
                                    </BlogTrackedLink>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-8 md:p-10">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                Keep reading
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                                Related articles
                            </h2>
                        </div>
                        <BlogTrackedLink
                            articleSlug={articleSlug}
                            category={article.category}
                            ctaRole="secondary"
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition-colors hover:text-cyan-100"
                            source="article_chrome"
                        >
                            Browse the full index
                            <ArrowRight size={15} />
                        </BlogTrackedLink>
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {relatedPosts.map((post) => (
                            <article
                                key={post.id}
                                className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/55"
                            >
                                <div className={`h-28 bg-gradient-to-br ${post.image}`} />
                                <div className="p-5">
                                    <span className="rounded-lg bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                                        {post.articleType}
                                    </span>
                                    <h3 className="mt-4 text-xl font-black tracking-tight text-white">
                                        <BlogTrackedLink
                                            articleSlug={articleSlug}
                                            category={article.category}
                                            ctaRole="contextual"
                                            href={`/blog/${toBlogSlug(post.title)}`}
                                            className="transition-colors hover:text-cyan-200"
                                            source="related_articles"
                                        >
                                            {post.title}
                                        </BlogTrackedLink>
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">
                                        {post.answerSummary}
                                    </p>
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {post.relatedConditionSlugs.slice(0, 2).map((slug) => (
                                            <span key={slug} className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                                                {CONDITION_LABELS[slug]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
