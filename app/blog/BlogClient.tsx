'use client';

import Image from 'next/image';
import { ArrowRight, Calendar, Clock, Microscope, Route, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BLOG_POSTS, type BlogConditionSlug, type BlogPost } from '@/constants/content';
import { conditionGoals } from '@/content/conditions';
import { toBlogSlug } from '@/lib/blog';
import { BlogHubTrackedLink } from './BlogHubTrackedLink';
import styles from './blog-reference.module.css';

type SortOption = 'latest' | 'readTime';

const BLOG_FILTER_ACTION_STATUS_ID = 'blog-filter-action-status';
const BLOG_FILTER_ACTION_STATUS_LABEL = 'Blog filter action status';
const BLOG_FILTER_READY_STATUS = 'Article filters ready.';

const BLOG_CATEGORY_TO_ROUTE_LABEL: Record<BlogPost['category'], string> = {
  HBOT: 'Open the HBOT hub',
  PEMF: 'Open the PEMF hub',
  RLT: 'Open the red-light hub',
  Hydrogen: 'Open the hydrogen hub',
  Protocols: 'Browse protocols',
};

const CONDITION_LABELS = conditionGoals.reduce<Record<BlogConditionSlug, string>>((acc, goal) => {
  acc[goal.slug] = goal.title;
  return acc;
}, {} as Record<BlogConditionSlug, string>);

const ARTICLE_IMAGES: Record<BlogPost['category'], string> = {
  HBOT: '/images/blog/card-hbot.jpg',
  PEMF: '/images/blog/card-pemf.jpg',
  RLT: '/images/blog/card-rlt.jpg',
  Hydrogen: '/images/blog/card-hydrogen.jpg',
  Protocols: '/images/blog/card-protocols.jpg',
};

const categoryBadgeClass = (category: BlogPost['category']): string => {
  switch (category) {
    case 'HBOT':
      return styles.badgeCategoryHBOT ?? '';
    case 'PEMF':
      return styles.badgeCategoryPEMF ?? '';
    case 'RLT':
      return styles.badgeCategoryRLT ?? '';
    case 'Hydrogen':
      return styles.badgeCategoryHydrogen ?? '';
    case 'Protocols':
      return styles.badgeCategoryProtocols ?? '';
    default:
      return styles.badgeOutline ?? '';
  }
};

const articleSlug = (post: BlogPost): string => toBlogSlug(post.title);
const articleHref = (post: BlogPost): string => `/blog/${articleSlug(post)}`;

const sortStatusCopy = (sortOption: SortOption): string =>
  sortOption === 'readTime' ? 'Quick reads sort applied.' : 'Latest-first sort applied.';

const getSupportLink = (post: BlogPost): { href: string; label: string } => {
  if (post.evidenceIds.length > 0) {
    return { href: '/research', label: 'Open cited research' };
  }

  const firstCondition = post.relatedConditionSlugs[0];
  if (firstCondition) {
    return {
      href: `/conditions/${firstCondition}`,
      label: `See ${CONDITION_LABELS[firstCondition]} guidance`,
    };
  }

  if (post.relatedProductRoute) {
    return {
      href: `/product/${post.relatedProductRoute}`,
      label: BLOG_CATEGORY_TO_ROUTE_LABEL[post.category],
    };
  }

  return { href: '/protocols', label: 'Browse protocols' };
};

function FeaturedArticleCard({ post }: { post: BlogPost }) {
  const supportLink = getSupportLink(post);
  const slug = articleSlug(post);

  return (
    <section aria-label="Featured article" className={styles.featuredSection}>
      <article
        aria-labelledby="featured-article-title"
        className={`${styles.featuredCardPanoramic ?? ''} relative overflow-hidden`}
        style={{ position: 'relative', minHeight: '420px' }}
      >
        <Image
          src="/images/blog/featured-hbot-chamber.jpg"
          alt="Luminous hyperbaric oxygen chamber in modern alpine sanctuary"
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 1280px"
          className={styles.featuredImageBackdrop}
        />
        <div className={styles.featuredCardGradient} />

        <div className={styles.featuredContentGrid}>
          <div>
            <div className={styles.badgeRow}>
              <span className={styles.badgeFeatured}>FEATURED</span>
              <span className={styles.badgeOutline}>{post.articleType}</span>
              {post.evidenceIds.length > 0 ? (
                <span className={styles.badgeOutline}>
                  <Microscope size={12} />
                  Evidence linked
                </span>
              ) : (
                <span className={styles.badgeOutline}>
                  <Route size={12} />
                  Goal-planning guide
                </span>
              )}
            </div>

            <h2 id="featured-article-title" className={styles.featuredTitle}>
              {post.title}
            </h2>

            <p className={styles.featuredExcerpt}>{post.excerpt}</p>

            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <Clock size={13} />
                {post.readTime}
              </span>
              <span className={styles.metaItem}>
                <Calendar size={13} />
                {post.date}
              </span>
              {post.relatedConditionSlugs.slice(0, 2).map((conditionSlug) => (
                <span key={conditionSlug} className={styles.tagPill}>
                  {CONDITION_LABELS[conditionSlug]}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.featuredActionsStack}>
            <BlogHubTrackedLink
              href={articleHref(post)}
              className={styles.primaryPill ?? ''}
              articleSlug={slug}
              category={post.category}
              ctaRole="primary"
              eventName="blog_route_article_clicked"
              source="featured_article"
            >
              <span>Read the article</span>
              <ArrowRight size={15} />
            </BlogHubTrackedLink>
            <BlogHubTrackedLink
              href={supportLink.href}
              className={styles.secondaryPill ?? ''}
              articleSlug={slug}
              category={post.category}
              ctaRole="secondary"
              source="featured_article"
            >
              <span>{supportLink.label}</span>
              <ArrowRight size={15} />
            </BlogHubTrackedLink>
          </div>
        </div>
      </article>
    </section>
  );
}

function ArticleCard({ post }: { post: BlogPost }) {
  const supportLink = getSupportLink(post);
  const slug = articleSlug(post);
  const imageSrc = ARTICLE_IMAGES[post.category] ?? '/images/blog/card-hbot.jpg';

  return (
    <article className={styles.articleCardClean}>
      <div
        className={`${styles.articleImageWrapper ?? ''} relative w-full overflow-hidden`}
        style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}
      >
        <Image
          src={imageSrc}
          alt={post.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, (max-width: 1440px) 33vw, 20vw"
          className={styles.articleImage}
        />
      </div>

      <div className={styles.articleCardBody}>
        <div className={styles.articleBadgeRow}>
          <span className={categoryBadgeClass(post.category)}>{post.category}</span>
          <span
            className={styles.badgeOutline}
            style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}
          >
            {post.articleType}
          </span>
          {post.evidenceIds.length > 0 ? (
            <span
              className={styles.badgeOutline}
              style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', color: '#047857' }}
            >
              <Microscope size={11} />
              Evidence linked
            </span>
          ) : null}
        </div>

        <h3 className={styles.articleCardTitle}>
          <BlogHubTrackedLink
            href={articleHref(post)}
            className="hover:text-cyan-700 transition-colors"
            articleSlug={slug}
            category={post.category}
            ctaRole="contextual"
            eventName="blog_route_article_clicked"
            source="article_grid"
          >
            {post.title}
          </BlogHubTrackedLink>
        </h3>

        <p className={styles.articleCardExcerpt}>{post.excerpt}</p>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {post.relatedConditionSlugs.slice(0, 2).map((conditionSlug) => (
            <span key={conditionSlug} className={styles.tagPill}>
              {CONDITION_LABELS[conditionSlug]}
            </span>
          ))}
        </div>

        <div className={styles.articleMetaRow}>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {post.readTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            {post.date}
          </span>
        </div>

        <div className={styles.articleActionsRow}>
          <BlogHubTrackedLink
            href={articleHref(post)}
            className={styles.articleReadLink ?? ''}
            articleSlug={slug}
            category={post.category}
            ctaRole="primary"
            eventName="blog_route_article_clicked"
            source="article_grid"
          >
            <span>Read article</span>
            <ArrowRight size={13} />
          </BlogHubTrackedLink>
          <BlogHubTrackedLink
            href={supportLink.href}
            className={styles.articleSupportLink ?? ''}
            articleSlug={slug}
            category={post.category}
            ctaRole="supporting"
            source="article_grid"
          >
            <span>{supportLink.label}</span>
            <ArrowRight size={12} />
          </BlogHubTrackedLink>
        </div>
      </div>
    </article>
  );
}

export function BlogClient() {
  const [selectedCategory, setSelectedCategory] = useState<BlogPost['category'] | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterActionStatus, setFilterActionStatus] = useState(BLOG_FILTER_READY_STATUS);

  const categories: Array<BlogPost['category'] | 'All'> = [
    'All',
    'HBOT',
    'PEMF',
    'RLT',
    'Hydrogen',
    'Protocols',
  ];

  const filteredPosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const posts = BLOG_POSTS.filter((post) => {
      if (selectedCategory !== 'All' && post.category !== selectedCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery) ||
        post.category.toLowerCase().includes(normalizedQuery) ||
        post.answerSummary.toLowerCase().includes(normalizedQuery) ||
        post.audience.toLowerCase().includes(normalizedQuery) ||
        post.keyTakeaways.join(' ').toLowerCase().includes(normalizedQuery) ||
        post.relatedConditionSlugs.join(' ').toLowerCase().includes(normalizedQuery)
      );
    });

    if (sortBy === 'readTime') {
      return [...posts].sort(
        (a, b) => Number.parseInt(a.readTime, 10) - Number.parseInt(b.readTime, 10)
      );
    }

    return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchQuery, selectedCategory, sortBy]);

  const showFeatured = selectedCategory === 'All' && searchQuery.trim().length === 0;
  const featuredPost = showFeatured
    ? (BLOG_POSTS.find((post) => post.evidenceIds.length > 0) ?? BLOG_POSTS[0] ?? null)
    : null;

  const updateSearchQuery = (nextQuery: string) => {
    setSearchQuery(nextQuery);
    setFilterActionStatus(
      nextQuery.trim()
        ? `Search filter updated for "${nextQuery.trim()}".`
        : 'Search filter cleared.'
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilterActionStatus('Search filter cleared.');
  };

  const updateSort = (nextSort: SortOption) => {
    setSortBy(nextSort);
    setFilterActionStatus(sortStatusCopy(nextSort));
  };

  const updateCategory = (category: BlogPost['category'] | 'All') => {
    setSelectedCategory(category);
    setFilterActionStatus(
      category === 'All'
        ? 'All article categories shown.'
        : `${category} article category selected.`
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('latest');
    setFilterActionStatus('Article filters reset.');
  };

  return (
    <>
      <p
        id={BLOG_FILTER_ACTION_STATUS_ID}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={BLOG_FILTER_ACTION_STATUS_LABEL}
        className="sr-only"
      >
        {filterActionStatus}
      </p>

      {featuredPost ? <FeaturedArticleCard post={featuredPost} /> : null}

      <section id="blog-article-grid" className={styles.indexSection}>
        <div className={styles.indexHeader}>
          <div>
            <span className={styles.kicker}>ARTICLE INDEX</span>
            <h2 className={styles.indexTitle}>
              <span className="sr-only">Article index: </span>
              Latest articles
            </h2>
          </div>

          <div className={styles.indexControls}>
            <span className={styles.countText}>
              Showing {filteredPosts.length} of {BLOG_POSTS.length} articles.
            </span>

            <div>
              <label htmlFor="blog-sort" className="sr-only">
                Sort articles
              </label>
              <select
                id="blog-sort"
                value={sortBy}
                onChange={(event) => updateSort(event.target.value as SortOption)}
                className={styles.sortSelect}
                aria-describedby={BLOG_FILTER_ACTION_STATUS_ID}
              >
                <option value="latest">Sort by: Latest first</option>
                <option value="readTime">Sort by: Quick reads</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.filterAndSearchRow}>
          <div className={styles.filterTabsRow}>
            {categories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => updateCategory(category)}
                  aria-pressed={isActive}
                  aria-describedby={BLOG_FILTER_ACTION_STATUS_ID}
                  className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ''}`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className={styles.searchPillWrapper}>
            <label htmlFor="blog-search" className="sr-only">
              Search articles, goals, or article intent
            </label>
            <Search size={14} className={styles.searchPillIcon} />
            <input
              id="blog-search"
              type="search"
              placeholder="Search articles, goals, or article intent"
              value={searchQuery}
              onChange={(event) => updateSearchQuery(event.target.value)}
              className={styles.searchPillInput}
              aria-describedby={BLOG_FILTER_ACTION_STATUS_ID}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={clearSearch}
                className={styles.searchPillClear}
                aria-label="Clear search"
                aria-describedby={BLOG_FILTER_ACTION_STATUS_ID}
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.articleGrid5Col}>
          {filteredPosts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className={styles.emptyStateCard}>
            <h3 className="text-lg font-medium text-slate-900">No article matches that search</h3>
            <p className="mt-2 text-sm text-slate-500">
              Reset the filters or move straight to research, conditions, or support.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className={styles.primaryPill ?? ''}
                aria-describedby={BLOG_FILTER_ACTION_STATUS_ID}
              >
                Reset filters
              </button>
              <BlogHubTrackedLink
                href="/research"
                className={styles.secondaryPill ?? ''}
                ctaRole="supporting"
                source="empty_state"
              >
                Open research
              </BlogHubTrackedLink>
              <BlogHubTrackedLink
                href="/conditions"
                className={styles.secondaryPill ?? ''}
                ctaRole="supporting"
                source="empty_state"
              >
                Browse conditions
              </BlogHubTrackedLink>
              <BlogHubTrackedLink
                href="/contact"
                className={styles.secondaryPill ?? ''}
                ctaRole="supporting"
                source="empty_state"
              >
                Ask Hylono
              </BlogHubTrackedLink>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
