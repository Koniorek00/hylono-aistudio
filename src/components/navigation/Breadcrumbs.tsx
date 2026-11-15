"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, List, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { PageNavigatorDropdown } from '../ui/BreadcrumbBar/PageNavigatorDropdown';
import {
  BreadcrumbNav,
  type BreadcrumbItem,
} from '../ui/BreadcrumbBar/BreadcrumbNav';

interface BreadcrumbsProps {
  pathParts: string[];
  showPageNavigator?: boolean;
  variant?: 'light' | 'dark';
}

const capitalizeWords = (str: string): string =>
  str.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const PAGE_LABELS: Record<string, string> = {
  home: 'Home',
  product: 'Store',
  'wellness-planner': 'Wellness Planner',
  dashboard: 'Portal',
  store: 'Store',
  blog: 'Science & Research',
  evidence: 'Clinical Library',
  'advisory-board': 'Medical Advisory',
  outcomes: 'Bio-Tracking',
  checkout: 'Checkout',
  privacy: 'Privacy',
  terms: 'Terms',
  shipping: 'Shipping',
  compare: 'Compare',
  'rent-vs-buy': 'Rent vs Buy',
  // Product tech route slugs are lowercase (e.g. /product/hbot)
  hbot: 'Hyperbaric',
  pemf: 'PEMF',
  rlt: 'Red Light',
  hydrogen: 'Hydrogen',
  ewot: 'EWOT',
  vns: 'Vagus Nerve',
  cryo: 'Cryotherapy',
  ems: 'EMS',
  hypoxic: 'Hypoxic Training',
  sauna_blanket: 'Sauna Blanket',
};

const NON_LINKABLE_PARENT_SEGMENTS = new Set(['compare', 'testing']);
const BREADCRUMB_ACTION_STATUS_ID = 'breadcrumb-navigation-action-status';
const BREADCRUMB_ACTION_STATUS_LABEL = 'Breadcrumb navigation action status';

const dropdownEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: { duration: 0.15, ease: dropdownEase },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: dropdownEase },
  },
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  pathParts,
  showPageNavigator = true,
  variant = 'light',
}) => {
  const parts = pathParts.filter((part) => part !== '');
  const isDark = variant === 'dark';
  const reduced = useReducedMotion();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const backToTopButtonClassName = [
    'flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-transparent',
    'transition-[color,background-color,border-color,box-shadow] duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2',
    'sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11px] sm:font-medium sm:tracking-[0.15em] sm:uppercase',
    hasScrolled
      ? isDark
        ? 'text-slate-600 hover:border-[var(--border-soft)] hover:bg-white hover:text-slate-950'
        : 'text-slate-500 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700'
      : isDark
        ? 'cursor-not-allowed text-slate-300'
        : 'cursor-not-allowed text-slate-300',
  ].join(' ');
  const pageNavigatorButtonClassName = [
    'flex min-h-11 items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5',
    'text-[11px] font-medium tracking-[0.15em] uppercase',
    'transition-[color,background-color,border-color,box-shadow] duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2',
    isDropdownOpen
      ? isDark
        ? 'border-[var(--accent-oxygen)] bg-white text-[var(--surface-ink)]'
        : 'border-slate-900 bg-slate-900 text-white'
      : isDark
        ? 'text-slate-600 hover:border-[var(--border-soft)] hover:bg-white hover:text-slate-950'
        : 'text-slate-500 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700',
  ].join(' ');
  const breadcrumbActionStatusMessage = isDropdownOpen
    ? 'Page sections menu is open. Escape closes it and returns focus to the trigger.'
    : hasScrolled
      ? 'Back to top and page sections navigation are available.'
      : 'Back to top is inactive until the page is scrolled; page sections navigation is available.';

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...parts.map((part, index) => {
      const label = PAGE_LABELS[part] || capitalizeWords(part);
      const isLast = index === parts.length - 1;
      const normalizedTarget = parts.slice(0, index + 1).join('/');
      const href = NON_LINKABLE_PARENT_SEGMENTS.has(normalizedTarget)
        ? undefined
        : normalizedTarget === 'product'
          ? '/store'
          : `/${normalizedTarget}`;

      return {
        label,
        href,
        isCurrent: isLast,
      };
    }),
  ];

  useEffect(() => {
    const updateScrollState = () => {
      setHasScrolled(window.scrollY > 24);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollState);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleScrollToTop = () => {
    if (!hasScrolled) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  if (parts.length === 0 || (parts.length === 1 && parts[0] === 'home')) {
    return null;
  }

  return (
    <nav
      aria-label="Page breadcrumb and navigation"
      className="futuristic-font mx-auto flex max-w-7xl flex-col gap-2 px-4 text-[11px] font-medium tracking-[0.08em] text-slate-500 normal-case sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:text-[13px] sm:tracking-[0.16em] sm:uppercase"
    >
      <div className="min-w-0 flex-1">
        <BreadcrumbNav items={breadcrumbItems} showHomeIcon={false} variant={variant} />
      </div>

      {showPageNavigator ? (
        <div
          className={`flex w-full shrink-0 items-center justify-end gap-2 self-start rounded-lg px-1 py-1 sm:ml-4 sm:w-auto sm:self-auto ${
            isDark
              ? 'border border-[var(--border-soft)] bg-white/80'
              : 'border border-slate-200 bg-white'
          }`}
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.8)' : '#ffffff',
            opacity: 1,
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
          }}
        >
          <button
            type="button"
            onClick={handleScrollToTop}
            className={backToTopButtonClassName}
            aria-label="Back to top"
            aria-describedby={BREADCRUMB_ACTION_STATUS_ID}
            title="Back to top"
            disabled={!hasScrolled}
          >
            <ArrowUp size={12} aria-hidden="true" />
            <span className="hidden sm:inline">Back to top</span>
          </button>

          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={pageNavigatorButtonClassName}
              aria-expanded={isDropdownOpen}
              aria-controls={isDropdownOpen ? 'breadcrumb-page-sections' : undefined}
              aria-label="Page sections navigation"
              aria-describedby={BREADCRUMB_ACTION_STATUS_ID}
            >
              <List size={12} aria-hidden="true" />
              <span className="hidden sm:inline">On This Page</span>
              <span className="sm:hidden">Navigate</span>
              <motion.span
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.2 }}
              >
                <ChevronDown size={12} aria-hidden="true" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  ref={dropdownRef}
                  id="breadcrumb-page-sections"
                  variants={reduced ? undefined : dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className={`absolute right-0 mt-2 w-72 max-w-[90vw] overflow-hidden rounded-lg ${
                    isDark
                      ? 'border border-[var(--border-soft)] bg-white shadow-xl shadow-slate-900/10'
                      : 'border border-slate-200 bg-white shadow-xl shadow-slate-900/15'
                  }`}
                  style={{
                    backgroundColor: '#ffffff',
                    opacity: 1,
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                  }}
                  aria-label="Page sections"
                >
                  <PageNavigatorDropdown
                    onSectionClick={() => setIsDropdownOpen(false)}
                    variant={variant}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p
            id={BREADCRUMB_ACTION_STATUS_ID}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={BREADCRUMB_ACTION_STATUS_LABEL}
            className="sr-only"
          >
            {breadcrumbActionStatusMessage}
          </p>
        </div>
      ) : null}
    </nav>
  );
};
