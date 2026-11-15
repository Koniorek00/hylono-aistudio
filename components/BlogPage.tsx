import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Clock,
  Compass,
  FileCheck,
  Headphones,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { BlogClient } from '@/app/blog/BlogClient';
import { BlogHubRouteActionStatus, BlogHubTrackedLink } from '@/app/blog/BlogHubTrackedLink';
import { BLOG_POSTS } from '@/constants/content';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import styles from '@/app/blog/blog-reference.module.css';

const HUB_ENTRY_PATHS = [
  {
    href: '/research',
    kicker: 'Need citations?',
    title: 'Open the research hub',
    description:
      'Read source studies, limitation notes, and modality summaries when the evidence question comes first.',
    image: '/images/blog/hub-citations.jpg',
    alt: 'Clinical laboratory glassware and research notes',
    icon: BookOpen,
  },
  {
    href: '/conditions',
    kicker: 'Goal first',
    title: 'Start with condition guidance',
    description:
      'Use recovery, sleep, stress, comfort, or vitality pages when the right modality is still unclear.',
    image: '/images/blog/hub-conditions.jpg',
    alt: 'Serene mountain lake reflecting peaks in daylight',
    icon: Compass,
  },
  {
    href: '/store',
    kicker: 'Comparing equipment?',
    title: 'Move to the product hubs',
    description:
      'Open the category hub when you already know the modality family and need product-level context.',
    image: '/images/blog/hub-equipment.jpg',
    alt: 'Modern architectural clinic room with hyperbaric chamber',
    icon: Building2,
  },
  {
    href: '/contact',
    kicker: 'Need a human next step?',
    title: 'Ask Hylono for planning help',
    description:
      'Use contact when the right path depends on scheduling, tolerance, or multi-modality planning.',
    image: '/images/blog/hub-guidance.jpg',
    alt: 'Warm luxury wellness consultation lounge with armchairs',
    icon: UserCheck,
  },
] as const;

const formatReviewDate = (): string =>
  new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export function BlogPage() {
  const guideCount = BLOG_POSTS.length;
  const evidenceLinkedCount = BLOG_POSTS.filter((post) => post.evidenceIds.length > 0).length;
  const coveredConditionCount = new Set(BLOG_POSTS.flatMap((post) => post.relatedConditionSlugs))
    .size;
  const displayReviewDate = formatReviewDate();

  return (
    <div className={styles.blogPage}>
      <BlogHubRouteActionStatus />

      {/* 1. HERO SECTION (FULL BLEED) */}
      <section
        aria-label="Blog introduction"
        className={`${styles.heroFullBleed ?? ''} relative w-full overflow-hidden`}
        style={{ position: 'relative', minHeight: '640px' }}
      >
        <Image
          src="/images/blog/hero-alpine-spa.jpg"
          alt="Alpine luxury wellness pavilion overlooking serene lake and mountains"
          fill
          priority
          unoptimized
          sizes="100vw"
          className={styles.heroBackdrop}
        />
        <div className={styles.heroFullGradient} />

        <div className={styles.heroInner}>
          <div className="max-w-2xl">
            <div className={styles.kickerWrapper}>
              <span className={styles.kicker}>SCIENCE &amp; GUIDE HUB</span>
              <div className={styles.kickerLine} />
            </div>

            <h1 id="blog-hero-headline" className={styles.heroTitle}>
              Find the article that matches your next Hylono question.
            </h1>

            <p id="blog-hero-description" className={styles.heroDescription}>
              Use the blog when you want a shorter, plain-language article before jumping into cited
              research, condition pages, product hubs, or protocol planning. This page is for
              orientation and decision support, not for inflated claims.
            </p>

            <div className={styles.btnGroup}>
              <BlogHubTrackedLink
                href="#blog-article-grid"
                className={styles.primaryPill ?? ''}
                ctaRole="primary"
                eventName="blog_route_cta_clicked"
                source="hero"
              >
                <span>Browse the article index</span>
                <ArrowRight size={15} />
              </BlogHubTrackedLink>
              <BlogHubTrackedLink
                href="/research"
                className={styles.secondaryPill ?? ''}
                ctaRole="secondary"
                source="hero"
              >
                <span>Go straight to research</span>
                <ArrowRight size={15} />
              </BlogHubTrackedLink>
            </div>
          </div>

          {/* Right vertical timeline stats stack */}
          <div className={styles.statsTimeline}>
            <div className={styles.timelineItem}>
              <span className={styles.timelineNumber}>{guideCount}</span>
              <span className={styles.timelineLabel}>current articles</span>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <span className={styles.timelineNumber}>{evidenceLinkedCount}</span>
              <span className={styles.timelineLabel}>evidence-linked notes</span>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineNumber}>{coveredConditionCount}</span>
              <span className={styles.timelineLabel}>connected condition paths</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PATH GUIDANCE CARDS (TEXT OVER IMAGE) */}
      <section aria-labelledby="path-hub-heading" className={styles.pathSection}>
        <div className={styles.pathHeader}>
          <div className="flex items-center gap-2 mb-1.5">
            <Compass size={14} className="text-slate-500" />
            <span className={styles.kicker} style={{ marginBottom: 0 }}>
              START WITH THE RIGHT PATH
            </span>
          </div>
          <div className={styles.pathHeaderSplit}>
            <h2
              id="path-hub-heading"
              className={styles.serifHeadline}
              style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)' }}
            >
              Use the hub that answers the real question first.
            </h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Use the blog for short orientation. If you need evidence, condition guidance,
              product context, or support, open the page built for that task.
            </p>
          </div>
        </div>

        <div className={styles.pathGrid}>
          {HUB_ENTRY_PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <article
                key={path.href}
                className={`${styles.pathCardOverImage ?? ''} relative overflow-hidden`}
                style={{ position: 'relative', height: '340px' }}
              >
                <Image
                  src={path.image}
                  alt={path.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={styles.pathCardBackdrop}
                />
                <div className={styles.pathCardOverlay}>
                  <div className={styles.pathIconBadge}>
                    <Icon size={16} />
                  </div>
                  <h3 className={styles.pathKickerText}>
                    <span>{path.kicker}</span>
                    <span className="sr-only">: {path.title}</span>
                  </h3>
                  <BlogHubTrackedLink
                    href={path.href}
                    className={styles.pathLinkText ?? ''}
                    ctaRole="contextual"
                    source="path_cards"
                    aria-label={`Open this path: ${path.title}`}
                  >
                    <span>{path.title}</span>
                    <span className="sr-only"> (open this path)</span>
                    <ArrowRight size={13} />
                  </BlogHubTrackedLink>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. CLIENT LEAF (FEATURED CARD & ARTICLE INDEX) */}
      <BlogClient />

      {/* 4. EDITORIAL & REVIEW CONTEXT */}
      <section aria-labelledby="editorial-context-title" className={styles.editorialSection}>
        <aside className={styles.editorialContainer}>
          <div className={styles.editorialColLeft}>
            <h2 id="editorial-context-title" className={styles.editorialTitle}>
              Editorial and review context
            </h2>
            <p className={styles.editorialDescription}>
              This hub is reviewed to keep the article layer connected to the Hylono topic graph,
              visible trust pages, and conservative evidence handling.
            </p>
          </div>

          <div className={styles.editorialColCenter}>
            <div className={styles.reviewItem}>
              <FileCheck size={18} className={styles.reviewItemIcon} />
              <div>
                <p className={styles.reviewItemLabel}>{siteOwnership.editorial.label}</p>
                <p className={styles.reviewItemValue}>{siteOwnership.editorial.team}</p>
                <p className={styles.reviewItemDetail}>
                  Owns article quality, clarity, and next-step guidance.
                </p>
              </div>
            </div>

            <div className={styles.reviewItem}>
              <ShieldCheck size={18} className={styles.reviewItemIcon} />
              <div>
                <p className={styles.reviewItemLabel}>{siteOwnership.research.label}</p>
                <p className={styles.reviewItemValue}>{siteOwnership.research.team}</p>
                <p className={styles.reviewItemDetail}>
                  Reviews evidence-linked pages and conservative wording.
                </p>
              </div>
            </div>

            <div className={styles.reviewItem}>
              <Clock size={18} className={styles.reviewItemIcon} />
              <div>
                <p className={styles.reviewItemLabel}>Last reviewed</p>
                <p className={styles.reviewItemValue}>{displayReviewDate}</p>
                <p className={styles.reviewItemDetail}>
                  Educational content on Hylono is reviewed for planning use, not as personalized
                  medical advice.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.editorialColRight}>
            <h3 className={styles.supportTitle}>Support coverage</h3>
            <div className={styles.supportHours}>
              <Clock size={15} className="mt-0.5 text-slate-400 shrink-0" />
              <span>
                {siteEntity.serviceArea} | {siteEntity.supportHours}
              </span>
            </div>
            <p className={styles.supportDetail}>
              Need a guided next step? Use {siteEntity.contactEmail} or contact Hylono.
            </p>
            <div className={styles.supportLinks}>
              <Link href="/about" className={styles.supportLink}>
                About Hylono <ArrowRight size={13} />
              </Link>
              <Link href="/help" className={styles.supportLink}>
                Support hub <ArrowRight size={13} />
              </Link>
              <Link href="/contact" className={styles.supportLink}>
                Contact Hylono <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
