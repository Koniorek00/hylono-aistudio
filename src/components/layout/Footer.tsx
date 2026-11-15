'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ArrowRight,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { openCookieSettings } from '../../lib/cookie-consent';

// The footer signup renders in the browser only. Server-rendered, it was a Suspense boundary of
// about 4 KB near the end of every page's prerendered shell, and React outlines such a boundary
// into its own streamed segment (<div hidden id="S:n">). With cacheComponents, React assigns that
// segment id while the shell is written out, after it has saved the counter for the dynamic part,
// so the dynamic part of /search reused the same id. The browser then put the signup form where
// the page's JSON-LD belonged and the JSON-LD into the footer, and React threw hydration error
// #418 twice. A client-only boundary is written as a bare template with no segment id.
const Newsletter = dynamic(
  () => import('../../../components/Newsletter').then((module) => module.Newsletter),
  {
    ssr: false,
    loading: () => <div className="min-h-11" aria-hidden="true" />,
  }
);

export const FOOTER_ACTION_STATUS_ID = 'footer-action-status';
export const FOOTER_ACTION_READY_STATUS =
  'Footer paths are ready. Use footer links for technology hubs, research, support, social channels, policies, and cookie settings.';
const FOOTER_ACTION_STATUS_LABEL = 'Footer action status';
const FALLBACK_YEAR = '2026';

// Custom Outlined Modality Icons matching Reference Column 1
function O2CircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <text
        x="8.5"
        y="14.8"
        fontSize="8"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
        fontFamily="sans-serif"
      >
        O
      </text>
      <text
        x="14"
        y="16.8"
        fontSize="5.5"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
        fontFamily="sans-serif"
      >
        2
      </text>
    </svg>
  );
}

function PulseWaveIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h3.5l2.5-7 4 14 3-9 2 4h3" />
    </svg>
  );
}

function RadiantSunIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2.5" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="21.5" y2="12" />
      <line x1="5.3" y1="5.3" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="18.7" y2="18.7" />
      <line x1="5.3" y1="18.7" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="18.7" y2="5.3" />
    </svg>
  );
}

function DropletIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.5C12 2.5 5.5 10.5 5.5 15a6.5 6.5 0 0 0 13 0c0-4.5-6.5-12.5-6.5-12.5z" />
    </svg>
  );
}

interface FooterLinkItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  actionMessage?: string;
  isButton?: boolean;
  onClick?: () => void;
}

interface FooterColumn {
  title: string;
  links: FooterLinkItem[];
  footerActionItem?: FooterLinkItem;
}

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export function Footer({ variant = 'default' }: FooterProps = {}) {
  const year = FALLBACK_YEAR;
  const [footerActionStatus, setFooterActionStatus] = useState(FOOTER_ACTION_READY_STATUS);

  const getFooterActionStatusProps = (message: string) => ({
    'aria-describedby': FOOTER_ACTION_STATUS_ID,
    onClick: () => setFooterActionStatus(message),
    onFocus: () => setFooterActionStatus(message),
  });

  const handleCookieSettingsClick = () => {
    setFooterActionStatus('Opening cookie settings from the footer.');
    openCookieSettings();
  };

  const socialLinks = [
    {
      href: 'https://www.instagram.com/hylono',
      label: 'Follow Hylono on Instagram',
      message: 'Opening Instagram from the footer.',
      icon: <Instagram size={15} />,
    },
    {
      href: 'https://x.com/hylono',
      label: 'Follow Hylono on X (Twitter)',
      message: 'Opening X from the footer.',
      icon: <span className="text-sm font-bold leading-none">𝕏</span>,
    },
    {
      href: 'https://www.linkedin.com/company/hylono',
      label: 'Follow Hylono on LinkedIn',
      message: 'Opening LinkedIn from the footer.',
      icon: <Linkedin size={15} />,
    },
    {
      href: 'https://www.youtube.com/@hylono',
      label: 'Subscribe to Hylono on YouTube',
      message: 'Opening YouTube from the footer.',
      icon: <Youtube size={15} />,
    },
  ];

  const columns: FooterColumn[] = [
    {
      title: 'Technology',
      links: [
        {
          label: 'Hyperbaric (HBOT)',
          href: '/product/hbot',
          icon: <O2CircleIcon className="h-4 w-4 text-cyan-700 shrink-0" />,
          actionMessage: 'Opening Hyperbaric (HBOT) from the footer.',
        },
        {
          label: 'Pulsed EMF (PEMF)',
          href: '/product/pemf',
          icon: <PulseWaveIcon className="h-4 w-4 text-purple-700 shrink-0" />,
          actionMessage: 'Opening Pulsed EMF (PEMF) from the footer.',
        },
        {
          label: 'Red Light (RLT)',
          href: '/product/rlt',
          icon: <RadiantSunIcon className="h-4 w-4 text-rose-700 shrink-0" />,
          actionMessage: 'Opening Red Light (RLT) from the footer.',
        },
        {
          label: 'Hydrogen (H₂)',
          href: '/product/hydrogen',
          icon: <DropletIcon className="h-4 w-4 text-teal-700 shrink-0" />,
          actionMessage: 'Opening Hydrogen (H2) from the footer.',
        },
      ],
      footerActionItem: {
        label: 'Compare all technologies',
        href: '/store',
        actionMessage: 'Opening Compare all technologies from the footer.',
      },
    },
    {
      title: 'Explore',
      links: [
        { label: 'Store', href: '/store', actionMessage: 'Opening Store from the footer.' },
        { label: 'For home', href: '/for-home', actionMessage: 'Opening For home from the footer.' },
        {
          label: 'For professionals',
          href: '/for-professionals',
          actionMessage: 'Opening For professionals from the footer.',
        },
        { label: 'Research', href: '/research', actionMessage: 'Opening Research from the footer.' },
        { label: 'Protocols', href: '/protocols', actionMessage: 'Opening Protocols from the footer.' },
        { label: 'Rentals', href: '/rental', actionMessage: 'Opening Rentals from the footer.' },
        {
          label: 'Consultation',
          href: '/consultation',
          actionMessage: 'Opening Consultation from the footer.',
        },
        { label: 'Help center', href: '/help', actionMessage: 'Opening Help center from the footer.' },
      ],
    },
    {
      title: 'Guides',
      links: [
        { label: 'Recovery', href: '/conditions/recovery', actionMessage: 'Opening Recovery guide from the footer.' },
        { label: 'Sleep', href: '/conditions/sleep', actionMessage: 'Opening Sleep guide from the footer.' },
        { label: 'Stress', href: '/conditions/stress', actionMessage: 'Opening Stress guide from the footer.' },
        { label: 'Comfort', href: '/conditions/comfort', actionMessage: 'Opening Comfort guide from the footer.' },
        { label: 'Vitality', href: '/conditions/vitality', actionMessage: 'Opening Vitality guide from the footer.' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Hylono', href: '/about', actionMessage: 'Opening About Hylono from the footer.' },
        { label: 'How it works', href: '/how-hylono-works', actionMessage: 'Opening How it works from the footer.' },
        {
          label: 'Safety & standards',
          href: '/safety-and-standards',
          actionMessage: 'Opening Safety & standards from the footer.',
        },
        {
          label: 'Service & support',
          href: '/service-and-support',
          actionMessage: 'Opening Service & support from the footer.',
        },
        { label: 'Contact', href: '/contact', actionMessage: 'Opening Contact from the footer.' },
        { label: 'Careers', href: '/careers', actionMessage: 'Opening Careers from the footer.' },
        { label: 'Press', href: '/press', actionMessage: 'Opening Press from the footer.' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy policy', href: '/privacy', actionMessage: 'Opening Privacy policy from the footer.' },
        { label: 'Terms of service', href: '/terms', actionMessage: 'Opening Terms of service from the footer.' },
        { label: 'Shipping policy', href: '/shipping', actionMessage: 'Opening Shipping policy from the footer.' },
        { label: 'Returns policy', href: '/returns', actionMessage: 'Opening Returns policy from the footer.' },
        { label: 'Warranty', href: '/warranty', actionMessage: 'Opening Warranty from the footer.' },
        { label: 'Cookie policy', href: '/cookie-policy', actionMessage: 'Opening Cookie policy from the footer.' },
        {
          label: 'Cookie settings',
          isButton: true,
          onClick: handleCookieSettingsClick,
          actionMessage: 'Opening cookie settings from the footer.',
        },
        { label: 'Sitemap', href: '/sitemap', actionMessage: 'Opening Sitemap from the footer.' },
      ],
    },
  ];

  if (variant === 'minimal') {
    return (
      <footer className="relative border-t border-slate-200 bg-slate-950 py-6 text-xs text-slate-400">
        <p
          id={FOOTER_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={FOOTER_ACTION_STATUS_LABEL}
          className="sr-only"
        >
          {footerActionStatus}
        </p>

        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <span className="font-heading text-sm font-bold tracking-widest text-white uppercase">
              HYLONO
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              European Regenerative Network
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[11px]">
            <div className="flex items-center gap-3">
              <Link
                href="/privacy"
                className="text-slate-400 hover:text-white transition-colors"
                {...getFooterActionStatusProps('Opening Privacy policy from the footer.')}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-slate-400 hover:text-white transition-colors"
                {...getFooterActionStatusProps('Opening Terms of service from the footer.')}
              >
                Terms
              </Link>
              <Link
                href="/shipping"
                className="text-slate-400 hover:text-white transition-colors"
                {...getFooterActionStatusProps('Opening Shipping policy from the footer.')}
              >
                Shipping
              </Link>
              <Link
                href="/returns"
                className="text-slate-400 hover:text-white transition-colors"
                {...getFooterActionStatusProps('Opening Returns policy from the footer.')}
              >
                Returns
              </Link>
              <Link
                href="/warranty"
                className="text-slate-400 hover:text-white transition-colors"
                {...getFooterActionStatusProps('Opening Warranty from the footer.')}
              >
                Warranty
              </Link>
              <button
                type="button"
                className="text-slate-400 hover:text-white transition-colors"
                aria-describedby={FOOTER_ACTION_STATUS_ID}
                onFocus={() => setFooterActionStatus('Opening cookie settings from the footer.')}
                onClick={handleCookieSettingsClick}
              >
                Cookies
              </button>
            </div>

            <div className="hidden sm:block h-3 w-px bg-white/20" />

            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded border border-white/10 text-slate-400 hover:border-white/30 hover:text-white transition-colors motion-reduce:transition-none"
                  aria-label={social.label}
                  {...getFooterActionStatusProps(social.message)}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative z-20 w-full overflow-hidden border-t border-slate-200/80 bg-[#f8fafc] text-slate-900 selection:bg-cyan-500/20">
      <p
        id={FOOTER_ACTION_STATUS_ID}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={FOOTER_ACTION_STATUS_LABEL}
        className="sr-only"
      >
        {footerActionStatus}
      </p>

      {/* ─────────────────────────────────────────────────────────────
          ZONE 01: Top Newsletter & Brand Intro (Luminous Ethereal)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#edf2f7] py-16 sm:py-20 lg:py-24">
        {/* Generated flowing silk asset layered seamlessly in the top right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-full w-full sm:w-[70%] lg:w-[55%] select-none overflow-hidden opacity-85 mix-blend-multiply"
        >
          <Image
            src="/images/footer/footer-ethereal-silk-flow.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-right-top"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f1f5f9] via-[#f1f5f9]/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1px_1fr] gap-10 lg:gap-14 items-start">
            {/* Left Column: Brand Lockup & Value Statement */}
            <div className="flex flex-col items-start pr-4">
              <Link
                href="/"
                prefetch={false}
                className="group flex flex-col items-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 rounded-sm"
                {...getFooterActionStatusProps('Opening home from the footer.')}
              >
                <span
                  data-testid="footer-logo-icon"
                  className="font-heading text-xl sm:text-2xl font-normal tracking-[0.38em] text-slate-900 uppercase transition-transform duration-500 motion-reduce:!transform-none motion-reduce:transition-none"
                >
                  HYLONO
                </span>
                <span className="mt-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                  GUIDED WELLNESS
                </span>
              </Link>

              <div className="my-6 h-px w-10 bg-slate-300" aria-hidden="true" />

              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 font-normal max-w-xs">
                Wellness technology for home and professional use, with guidance, delivery and service from one team.
              </p>
            </div>

            {/* Vertical Hairline Divider between Brand and Newsletter on Desktop */}
            <div
              className="hidden lg:block w-px bg-slate-300/60 self-stretch my-1"
              aria-hidden="true"
            />

            {/* Right Column: Stay Informed & Newsletter Subscription */}
            <div className="flex flex-col items-start justify-center w-full">
              <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                STAY INFORMED
              </span>

              <h3 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-slate-900 leading-tight mb-3">
                Research. Protocols. Updates.
              </h3>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 max-w-xl mb-7">
                Research summaries, protocol releases and product updates. No spam.
              </p>

              <div className="w-full">
                <Newsletter variant="reference" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ZONE 02: Architectural 5-Column Navigation Matrix
          ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200/90 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-0 lg:divide-x lg:divide-slate-200/80">
            {columns.map((column, colIdx) => (
              <div
                key={column.title}
                className={`min-w-0 ${
                  colIdx === 0
                    ? 'lg:pr-8'
                    : colIdx === columns.length - 1
                    ? 'lg:pl-8'
                    : 'lg:px-8'
                }`}
              >
                <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-800 font-mono">
                  {column.title}
                </h4>

                <ul className="space-y-0.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`} className="min-w-0">
                      {link.isButton ? (
                        <button
                          type="button"
                          className="group flex min-h-11 w-full items-center justify-between py-2 text-xs text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 rounded-sm text-left"
                          aria-describedby={FOOTER_ACTION_STATUS_ID}
                          onFocus={() =>
                            setFooterActionStatus(
                              link.actionMessage || `Opening ${link.label} from the footer.`
                            )
                          }
                          onClick={() => {
                            setFooterActionStatus(
                              link.actionMessage || `Opening ${link.label} from the footer.`
                            );
                            link.onClick?.();
                          }}
                        >
                          <span className="break-words group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none">
                            {link.label}
                          </span>
                          <span
                            className="shrink-0 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all motion-reduce:transform-none text-xs font-mono ml-2"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={link.href!}
                          prefetch={false}
                          className="group flex min-h-11 w-full items-center justify-between py-2 text-xs text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 rounded-sm"
                          {...getFooterActionStatusProps(
                            link.actionMessage || `Opening ${link.label} from the footer.`
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {link.icon ? (
                              <span className="shrink-0 transition-transform group-hover:scale-110 motion-reduce:transform-none">
                                {link.icon}
                              </span>
                            ) : null}
                            <span className="break-words group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none">
                              {link.label}
                            </span>
                          </div>
                          <span
                            className="shrink-0 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all motion-reduce:transform-none text-xs font-mono ml-2"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                {column.footerActionItem ? (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      href={column.footerActionItem.href!}
                      prefetch={false}
                      className="group flex min-h-11 items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-cyan-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 rounded-sm"
                      {...getFooterActionStatusProps(
                        column.footerActionItem.actionMessage ||
                          `Opening ${column.footerActionItem.label} from the footer.`
                      )}
                    >
                      <span className="group-hover:underline">
                        {column.footerActionItem.label}
                      </span>
                      <span
                        className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none text-xs font-mono"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ZONE 03: Bottom Panoramic Nordic Alpine Landscape Banner
          ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 py-10 sm:py-12 text-white">
        {/* Ultra-wide Nordic Mountain Fjord Photography */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        >
          <Image
            src="/images/footer/footer-alpine-fjord-panorama.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-65"
            priority={false}
          />
          {/* Subtle dark gradient overlay to ensure text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/70 to-slate-950/85" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Brand Name & Purpose statement */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="font-heading text-sm sm:text-base font-normal tracking-[0.3em] text-white uppercase">
                HYLONO
              </span>
              <div className="hidden sm:block h-3.5 w-px bg-white/20" aria-hidden="true" />
              <p className="text-[11px] sm:text-xs text-slate-300 font-normal leading-relaxed max-w-md">
                Equipment for general wellness use. Not a medical service.
              </p>
            </div>

            {/* Right: Social Glyphs & Copyright */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 motion-reduce:transition-none"
                    aria-label={social.label}
                    {...getFooterActionStatusProps(social.message)}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              <div className="hidden sm:block h-3.5 w-px bg-white/20" aria-hidden="true" />

              <p className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                © {year} HYLONO SYSTEMS. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
