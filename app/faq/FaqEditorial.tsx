'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Headphones,
  Mail,
  Shield,
  Clock,
  Calendar,
  CheckCircle2,
  Atom,
  Box,
  Truck,
  Plus,
  Minus,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { HELP_FAQ_DATA } from '@/content/help-faq';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import { PageOwnership } from '@/components/content/PageOwnership';
import {
  FaqRouteActionStatus,
  FaqTrackedEmailLink,
  FaqTrackedLink,
} from './FaqTrackedLink';
import styles from './faq-editorial.module.css';

const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const faqRouteCards = [
  {
    title: 'FAQ library',
    description:
      'Start here when the answer can be handled by the public question set before a manual request.',
    href: '#faq-library',
    label: 'Search the FAQ',
    icon: BookOpen,
  },
  {
    title: 'Help center',
    description:
      'Use the help center when you need support options, device support, or a contact-tab handoff.',
    href: '/help',
    label: 'Open help',
    icon: Headphones,
  },
  {
    title: 'Contact Hylono',
    description:
      'Use contact when your question depends on product, rental, or protocol context that needs a reply.',
    href: '/contact',
    label: 'Contact Hylono',
    icon: Mail,
  },
] as const;

const faqPolicyLinks = [
  { href: '/rental', label: 'Rental path' },
  { href: '/shipping', label: 'Shipping guidance' },
  { href: '/warranty', label: 'Warranty guidance' },
] as const;

const categoryIcons = [ShieldCheck, Atom, Box, Headphones];

const categoryTeaserDetails: Record<
  string,
  { image: string; description: string }
> = {
  'About Hylono': {
    image: '/images/faq/hero-travertine.jpg',
    description: 'General questions about our platform and devices.',
  },
  'Science & Protocols': {
    image: '/images/faq/cat-science.jpg',
    description: 'Questions about protocols, safety and usage.',
  },
  'Products & Purchasing': {
    image: '/images/faq/cat-products.jpg',
    description: 'Choosing a product, rental options and warranty.',
  },
  'Shipping & Support': {
    image: '/images/faq/cat-shipping.jpg',
    description: 'Delivery, installation, tracking and returns.',
  },
};

export function FaqEditorial() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '0-0': true, // First question expanded by default per reference image
  });

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  // Filtered items when searching
  const searchResults = isSearching
    ? HELP_FAQ_DATA.flatMap((cat, ci) =>
        cat.items
          .filter(
            (item) =>
              item.q.toLowerCase().includes(normalizedQuery) ||
              item.a.toLowerCase().includes(normalizedQuery)
          )
          .map((item, ii) => ({
            ...item,
            category: cat.category,
            key: `${ci}-${ii}`,
          }))
      )
    : [];

  const currentCategory = (HELP_FAQ_DATA[activeCategoryIndex] ?? HELP_FAQ_DATA[0])!;

  return (
    <div className={styles.faqEditorialRoot} data-testid="faq-editorial-root">
      <FaqRouteActionStatus />

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 1: HERO (Asymmetrical Travertine Editorial + Scrim)
          ───────────────────────────────────────────────────────────────── */}
      <section className={styles.faqHeroSection} aria-label="Support & FAQ Hero">
        <Image
          src="/images/faq/hero-travertine.jpg"
          alt="Sunlit minimalist travertine wellness interior with olive tree and daybed"
          fill
          priority
          sizes="100vw"
          className={styles.faqHeroBgImage}
        />
        <div className={styles.faqHeroScrim} aria-hidden="true" />

        {/* Vertical Track on right margin */}
        <aside className={`${styles.faqVerticalTrack} hidden xl:flex`} aria-hidden="true">
          <div className={styles.faqTrackDot} />
          <div className={styles.faqTrackLine} />
          <span className={styles.faqTrackText}>Direct Support Answers</span>
          <span className={styles.faqTrackText}>Products</span>
          <span className={styles.faqTrackText}>Rental</span>
          <span className={styles.faqTrackText}>Delivery</span>
          <span className={styles.faqTrackText}>Warranty</span>
          <span className={styles.faqTrackText}>Support</span>
        </aside>

        <div className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-20 sm:pt-20 sm:pb-28 lg:px-12 ${styles.faqHeroContent}`}>
          <div className="max-w-2xl">
            <p className={styles.faqKicker} style={{ color: '#50606b' }}>
              Direct support answers
            </p>

            <h1
              id="faq-hero-headline"
              className={`${styles.faqHeadline} mt-4 text-4xl sm:text-5xl lg:text-6xl font-medium text-[#101820]`}
            >
              Get direct Hylono answers before opening a support request
            </h1>

            <p
              id="faq-hero-description"
              className="mt-6 text-base sm:text-lg leading-relaxed text-[#50606b]"
            >
              Use this FAQ for product, rental, delivery, warranty, and support
              questions. If the answer depends on your product, rental, or protocol context, move
              to help or contact with that context.
            </p>

            {/* Interactive Search Bar Moment */}
            <div className="mt-8">
              <label htmlFor="faq-hero-search-input" className="sr-only">
                Search questions
              </label>
              <div className={styles.faqSearchPill}>
                <Search className="h-5 w-5 text-[#7a858d] flex-shrink-0 ml-1" aria-hidden="true" />
                <input
                  id="faq-hero-search-input"
                  type="search"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.faqSearchInput}
                />
                <FaqTrackedLink
                  href="#faq-library"
                  eventName="faq_route_cta_clicked"
                  ctaRole="primary"
                  source="hero"
                  className={styles.faqSearchButton || ''}
                >
                  <span className="sr-only">Search the FAQ</span>
                  <ArrowRight className="h-4 w-4" />
                </FaqTrackedLink>
              </div>
            </div>

            {/* Quick Action Links Row */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-[#50606b] mr-1">Need human help instead?</span>
              <FaqTrackedLink
                href="/help"
                eventName="faq_support_route_clicked"
                ctaRole="supporting"
                source="hero"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#e8dfd2] bg-white/95 px-4 py-2 text-xs font-semibold text-[#101820] shadow-xs hover:border-[#101820] hover:bg-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a8c]"
              >
                <Headphones className="h-3.5 w-3.5 text-[#50606b]" aria-hidden="true" />
                <span>Open help</span>
                <ArrowRight className="h-3 w-3 text-[#7a858d]" />
              </FaqTrackedLink>
              <FaqTrackedLink
                href="/contact"
                eventName="faq_support_route_clicked"
                ctaRole="supporting"
                source="hero"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#e8dfd2] bg-white/95 px-4 py-2 text-xs font-semibold text-[#101820] shadow-xs hover:border-[#101820] hover:bg-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a8c]"
              >
                <Mail className="h-3.5 w-3.5 text-[#50606b]" aria-hidden="true" />
                <span>Contact Hylono</span>
                <ArrowRight className="h-3 w-3 text-[#7a858d]" />
              </FaqTrackedLink>
            </div>

            {/* Support Facts Metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-[#50606b]">
              <span className="rounded-full border border-[#e8dfd2] bg-white/90 px-3.5 py-1.5 font-medium shadow-xs">
                Monday to Friday, 09:00 to 18:00 CET
              </span>
              <span className="rounded-full border border-[#e8dfd2] bg-white/90 px-3.5 py-1.5 font-medium shadow-xs">
                EU support coverage
              </span>
              <FaqTrackedEmailLink
                href={`mailto:${siteEntity.supportEmail}`}
                focusStatusMessage="Support email is ready from the FAQ route."
                clickStatusMessage="Opening support email from the FAQ route."
                className="inline-flex items-center min-h-[44px] rounded-full border border-[#e8dfd2] bg-white/90 px-3.5 py-1.5 font-semibold text-[#101820] underline underline-offset-4 hover:text-[#2f9fb3] transition-colors shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a8c]"
              >
                {siteEntity.supportEmail}
              </FaqTrackedEmailLink>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 2: OPTIONS CARDS (3-Card Bento + Policy Handoffs)
          ───────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:px-12" aria-labelledby="faq-options-heading">
        <div className="text-center sm:text-left">
          <h2
            id="faq-options-heading"
            className={`${styles.faqSectionTitle} text-3xl sm:text-4xl font-normal text-[#101820]`}
          >
            Start with the option that matches the answer you need
          </h2>
          <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-[#50606b]">
            The FAQ should reduce support friction without hiding human help. Use the public
            answer set first, then move into help or contact when your question needs context.
          </p>
        </div>

        {/* 3 Bento Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {faqRouteCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className={styles.faqCardBento}>
                <div className={styles.faqIconBadge} aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </div>
                <h3
                  className="text-xl font-medium tracking-tight text-[#101820]"
                  style={{ fontFamily: 'var(--font-editorial, Georgia, serif)' }}
                >
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#50606b] flex-grow">
                  {card.description}
                </p>
                <div className="mt-6 pt-4 border-t border-[rgba(232,223,210,0.6)]">
                  <FaqTrackedLink
                    href={card.href}
                    eventName={
                      card.href === '#faq-library'
                        ? 'faq_route_cta_clicked'
                        : 'faq_support_route_clicked'
                    }
                    ctaRole={card.href === '#faq-library' ? 'primary' : 'supporting'}
                    source="route_map"
                    className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[#101820] hover:text-[#2f9fb3] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a8c]"
                  >
                    <span>{card.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </FaqTrackedLink>
                </div>
              </article>
            );
          })}
        </div>

        {/* Policy Handoffs Rail */}
        <div className="mt-10 pt-6 border-t border-[rgba(232,223,210,0.7)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className={styles.faqKicker} style={{ color: '#7a858d' }}>
              Policy handoffs
            </p>
            <p className="mt-1 text-sm text-[#50606b]">
              If your FAQ question is about access, delivery, or warranty context, use the
              matching policy page before opening a manual request.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {faqPolicyLinks.map((link) => (
              <FaqTrackedLink
                key={link.href}
                href={link.href}
                eventName="faq_support_route_clicked"
                ctaRole="supporting"
                source="trust_context"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e8dfd2] bg-white px-4 py-2 text-xs font-semibold text-[#101820] shadow-sm hover:border-[#101820] hover:bg-[#f7f4ee] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a8c]"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-3 w-3" />
              </FaqTrackedLink>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 3: FAQ LIBRARY & SIDEBAR (Asymmetric 2-Column Grid)
          ───────────────────────────────────────────────────────────────── */}
      <section
        id="faq-library"
        className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:px-12 scroll-mt-20"
        aria-label="FAQ Knowledge Base"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] w-full min-w-0">
          {/* Left Column: Category Rail & PageOwnership */}
          <aside className="space-y-6 max-w-full overflow-hidden">
            {/* Category Nav Rail */}
            <div className="rounded-2xl border border-[rgba(232,223,210,0.82)] bg-[#fffdf8] p-4 shadow-sm max-w-full overflow-hidden">
              <p className={`${styles.faqKicker} px-3 pt-2 pb-3`} style={{ color: '#7a858d' }}>
                FAQ Library
              </p>
              <nav aria-label="FAQ Categories" className="space-y-1.5">
                {HELP_FAQ_DATA.map((cat, idx) => {
                  const Icon = categoryIcons[idx] ?? HelpCircle;
                  const isActive = !isSearching && activeCategoryIndex === idx;
                  return (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => {
                        setActiveCategoryIndex(idx);
                        setSearchQuery('');
                      }}
                      className={`${styles.faqCategoryButton} ${
                        isActive ? styles.faqCategoryButtonActive : ''
                      }`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-[#50606b]" />
                        <span>{cat.category}</span>
                      </div>
                      <span className={styles.faqCountBadge}>{cat.items.length}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Answer Scope Card */}
            <div className="rounded-2xl border border-[rgba(232,223,210,0.82)] bg-[#fffdf8] p-5 sm:p-6 shadow-sm max-w-full overflow-hidden">
              <p className={styles.faqKicker} style={{ color: '#7a858d' }}>
                Answer scope
              </p>
              <h2
                className={`${styles.faqSectionTitle} mt-2 text-2xl font-normal text-[#101820]`}
              >
                What this page can answer
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#50606b]">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2f9fb3] mt-2 flex-shrink-0" />
                  <span>Public answers about Hylono support, delivery, rental, and policy pages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2f9fb3] mt-2 flex-shrink-0" />
                  <span>General product and protocol-planning questions that do not need account data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2f9fb3] mt-2 flex-shrink-0" />
                  <span>
                    Urgent or emergency situations should go to local emergency services instead of
                    this public FAQ.
                  </span>
                </li>
              </ul>
            </div>

            {/* PageOwnership Card */}
            <div className={`rounded-2xl border border-[rgba(232,223,210,0.82)] bg-[#fffdf8] p-5 sm:p-6 shadow-sm max-w-full overflow-hidden ${styles.faqSidebarOwnership}`}>
              <PageOwnership
                eyebrow="Ownership and trust"
                title="Who maintains this FAQ"
                description="Use this page for public support answers before sending a manual request."
                items={[
                  {
                    label: siteOwnership.commerce.label,
                    value: siteOwnership.commerce.team,
                    detail: 'Maintains public support guidance, commerce support, and FAQ alignment.',
                  },
                  {
                    label: 'Support email',
                    value: siteEntity.supportEmail,
                    detail: 'Published support channel for questions that need manual follow-up.',
                  },
                  {
                    label: 'Support hours',
                    value: siteEntity.supportHours,
                    detail: 'Canonical support window from the shared site entity record.',
                  },
                  {
                    label: 'Last reviewed',
                    value: displayReviewDate,
                    detail: 'Current content review date used for FAQ freshness and support context.',
                  },
                ]}
                actions={[
                  { href: '/help', label: 'Open help' },
                  { href: '/contact', label: 'Contact Hylono' },
                  { href: '/about', label: 'Review about' },
                ]}
                note="FAQ answers are public support guidance, not emergency support or personalized medical advice."
                variant="default"
              />
            </div>
          </aside>

          {/* Right Column: Accordion Questions & Teasers */}
          <div>
            {/* When searching, show search result feedback */}
            {isSearching ? (
              <div className="mb-6">
                <p className={styles.faqKicker} style={{ color: '#7a858d' }}>
                  Search Results
                </p>
                <div className="flex items-baseline justify-between mt-1">
                  <h2 className={`${styles.faqSectionTitle} text-3xl font-medium text-[#101820]`}>
                    Questions matching &ldquo;{searchQuery}&rdquo;
                  </h2>
                  <span className="text-sm font-semibold text-[#50606b]">
                    {searchResults.length} {searchResults.length === 1 ? 'QUESTION' : 'QUESTIONS'}
                  </span>
                </div>
                {searchResults.length === 0 && (
                  <div className="mt-8 rounded-2xl border border-[rgba(232,223,210,0.82)] bg-white p-8 text-center">
                    <p className="text-base font-medium text-[#101820]">No matching questions found</p>
                    <p className="mt-2 text-sm text-[#50606b]">
                      Try adjusting your keywords or reach out via our contact options.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className={styles.faqKicker} style={{ color: '#7a858d' }}>
                      {currentCategory.category}
                    </p>
                    <h2
                      className={`${styles.faqSectionTitle} mt-1 text-2xl sm:text-3xl font-medium text-[#101820]`}
                    >
                      {categoryTeaserDetails[currentCategory.category]?.description ??
                        'General questions about our platform and devices.'}
                    </h2>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#50606b] flex-shrink-0">
                    {currentCategory.items.length} QUESTIONS
                  </span>
                </div>
                {currentCategory.evidenceSource && (
                  <p className="mt-2 text-xs text-[#7a858d]">
                    Evidence source: {currentCategory.evidenceSource}
                  </p>
                )}
              </div>
            )}

            {/* Accordion Questions List */}
            <div className="space-y-3.5">
              {(isSearching ? searchResults : currentCategory.items).map((item, idx) => {
                const itemKey = isSearching ? (item as any).key : `${activeCategoryIndex}-${idx}`;
                const isOpen = !!expandedItems[itemKey];

                return (
                  <article key={item.q} className={styles.faqAccordionItem}>
                    <button
                      type="button"
                      onClick={() => toggleItem(itemKey)}
                      aria-expanded={isOpen}
                      className={styles.faqAccordionHeader}
                    >
                      <div className="flex items-center gap-3.5 pr-4 text-left">
                        <ChevronDown
                          className={`h-4 w-4 text-[#7a858d] flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-0 text-[#101820]' : '-rotate-90'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{item.q}</span>
                      </div>
                      <div className={styles.faqToggleCircle} aria-hidden="true">
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className={styles.faqAccordionBody}>
                        <div className="border-t border-[rgba(232,223,210,0.6)] pt-4 pl-7 text-[#50606b]">
                          <p>{item.a}</p>
                          {'category' in item && (
                            <p className="mt-2 text-xs font-semibold text-[#2f9fb3]">
                              Category: {(item as any).category}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Teaser Cards for Other Categories (Shown when not searching) */}
            {!isSearching && (
              <div className="mt-10 space-y-4">
                <p className={styles.faqKicker} style={{ color: '#7a858d' }}>
                  Explore other categories
                </p>
                {HELP_FAQ_DATA.map((cat, idx) => {
                  if (idx === activeCategoryIndex) return null;
                  const details = categoryTeaserDetails[cat.category];

                  return (
                    <div
                      key={cat.category}
                      onClick={() => setActiveCategoryIndex(idx)}
                      className={styles.faqCategoryTeaser}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setActiveCategoryIndex(idx);
                        }
                      }}
                      aria-label={`View ${cat.category} questions`}
                    >
                      <div className="relative h-16 w-20 sm:h-24 sm:w-40 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={details?.image ?? '/images/faq/hero-travertine.jpg'}
                          alt={cat.category}
                          fill
                          sizes="(max-width: 640px) 80px, 160px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`${styles.faqKicker} tracking-wider sm:tracking-[0.28em]`} style={{ color: '#7a858d' }}>
                          {cat.category}
                        </p>
                        <p className="mt-1 text-sm sm:text-base font-medium text-[#101820] break-words">
                          {details?.description}
                        </p>
                        <p className="mt-1 text-xs text-[#50606b]">
                          {cat.items.length} QUESTIONS
                        </p>
                      </div>
                      <div className={styles.faqToggleCircle} aria-hidden="true">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 4: DARK LEATHER / CHAMBER PORTHOLE CTA BAND
          ───────────────────────────────────────────────────────────────── */}
      <section className={styles.faqCtaBand} aria-labelledby="faq-tailored-heading">
        <Image
          src="/images/faq/cta-chamber-porthole.jpg"
          alt="Illuminated circular hyperbaric chamber porthole in dark luxury leather lounge"
          fill
          sizes="100vw"
          className={styles.faqCtaBgImage}
        />
        <div className={styles.faqCtaScrim} aria-hidden="true" />

        <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 ${styles.faqCtaContent}`}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              <p
                className={styles.faqKicker}
                style={{ color: 'rgba(215, 168, 79, 0.9)' }} /* Warm Champagne Gold */
              >
                Need a tailored answer?
              </p>
              <h2
                id="faq-tailored-heading"
                className={`${styles.faqHeadline} mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium text-white`}
              >
                Open the contact options.
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
                Use the contact tab for product matching, delivery questions, or support triage.
              </p>
              <div className="mt-8">
                <FaqTrackedLink
                  href="/contact"
                  eventName="faq_support_route_clicked"
                  ctaRole="primary"
                  source="route_map"
                  className={styles.faqCtaPillButton || ''}
                >
                  <span>Open contact options</span>
                  <ArrowRight className="h-4 w-4" />
                </FaqTrackedLink>
              </div>
            </div>

            {/* Right Service Bullets Rail */}
            <div className="space-y-4 lg:pl-10">
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/[0.1] hover:translate-x-1 motion-reduce:transform-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white flex-shrink-0">
                  <Box className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">Product matching</h3>
                  <p className="text-xs text-slate-300">Tailored modality matching with physical constraints</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/[0.1] hover:translate-x-1 motion-reduce:transform-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white flex-shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">Delivery questions</h3>
                  <p className="text-xs text-slate-300">European logistics, installation, and floor planning</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/[0.1] hover:translate-x-1 motion-reduce:transform-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white flex-shrink-0">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">Support triage</h3>
                  <p className="text-xs text-slate-300">Direct escalation for active rentals and system owners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5: REGULATORY & EMERGENCY NOTICE STRIP
          ───────────────────────────────────────────────────────────────── */}
      <aside className={styles.faqNoticeStrip} aria-label="Legal and safety disclaimer">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#7a858d] flex-shrink-0" aria-hidden="true" />
            <p>
              Urgent or emergency situations should go to local emergency services instead of this
              public FAQ.
            </p>
          </div>
          <div className="text-right sm:border-l sm:border-[#e8dfd2] sm:pl-6">
            <p className="text-xs text-[#7a858d]">
              Wellness device for general wellbeing use. Consult a qualified healthcare
              professional before use.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
