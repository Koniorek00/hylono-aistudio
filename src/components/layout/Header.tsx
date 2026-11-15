'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  Hexagon,
  Accessibility,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'motion/react';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { TECH_DETAILS } from '../../../constants';
import { batch3NavigationContent } from '../../../content/batch3';
import { isFeatureEnabled } from '../../../utils/featureFlags';
import { useMultitoolStore } from '@/src/stores/multitoolStore';
import { resolvePublicControlPanelUrl } from './controlPanelUrl';
import {
  getCurrentPageFromPathname,
  navigateWithScroll,
  resolveLegacyPagePath,
} from '../../lib/navigation';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { CartIcon } from '../../../components/Cart';

export const HEADER_ACTION_STATUS_ID = 'header-action-status';

const loadMegaMenu = () =>
  import('../../../components/MegaMenu').then((module) => ({
    default: module.MegaMenu,
  }));
const MegaMenu = dynamic(loadMegaMenu, { loading: () => null });
const GlobalSearch = dynamic(
  () =>
    import('../../../components/GlobalSearch').then((module) => ({
      default: module.GlobalSearch,
    })),
  {
    loading: () => null,
    ssr: false,
  }
);

type NavLinkProps = {
  label: string;
  target: string;
  currentPage: string;
  onClick?: () => void;
  variant?: 'desktop' | 'mobile';
};

function NavLink({ label, target, currentPage, onClick, variant = 'desktop' }: NavLinkProps) {
  const isCurrent = currentPage === target;

  if (variant === 'mobile') {
    return (
      <Link
        href={resolveLegacyPagePath(target) ?? '/'}
        prefetch={false}
        onClick={onClick}
        aria-current={isCurrent ? 'page' : undefined}
        className={`group flex min-h-12 w-full items-center justify-between rounded-xl px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] transition-all outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
          isCurrent
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-800 hover:bg-slate-100/80 active:bg-slate-200/80'
        }`}
      >
        <span>{label}</span>
        <ArrowRight
          className={`h-4 w-4 transition-transform duration-200 ${
            isCurrent ? 'text-cyan-300' : 'text-slate-400 group-hover:translate-x-1'
          }`}
          aria-hidden="true"
        />
      </Link>
    );
  }

  return (
    <Link
      href={resolveLegacyPagePath(target) ?? '/'}
      prefetch={false}
      onClick={onClick}
      aria-current={isCurrent ? 'page' : undefined}
      className={`group relative inline-flex min-h-11 items-center whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 ${
        isCurrent ? 'text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-950 hover:-translate-y-0.5'
      }`}
    >
      <span className="relative z-10">{label}</span>
      <span
        className={`absolute -bottom-2 left-0 h-[2px] w-full rounded-full origin-right scale-x-0 bg-cyan-400 transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100 motion-reduce:transition-none motion-reduce:duration-0 ${
          isCurrent ? 'scale-x-100' : ''
        }`}
      />
    </Link>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const navRef = useRef<HTMLElement | null>(null);
  const stableHeaderHeightRef = useRef(0);
  const currentPage = getCurrentPageFromPathname(pathname);
  const [isScrolled, setIsScrolled] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [megaMenuPrimed, setMegaMenuPrimed] = useState(false);
  const [headerActionStatus, setHeaderActionStatus] = useState(
    'Header navigation controls are ready.'
  );
  const handleMegaMenuClose = useCallback(() => {
    setMegaMenuOpen(false);
    setHeaderActionStatus('Explore menu closed.');
  }, []);
  const handleMobileMenuClose = useCallback(() => {
    setMobileOpen(false);
    setHeaderActionStatus('Mobile navigation menu closed.');
  }, []);
  const handleCartCheckout = useCallback(() => {
    setMegaMenuOpen(false);
    setMobileOpen(false);
  }, []);
  const handleGlobalSearchOpen = useCallback(() => {
    setMegaMenuOpen(false);
    setMobileOpen(false);
  }, []);
  const primeMegaMenu = useCallback(() => {
    setMegaMenuPrimed(true);
    void loadMegaMenu();
  }, []);
  const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return window.localStorage.getItem('hylono_announcement_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const { isOpen: multitoolOpen, toggle: toggleMultitool, openAtPosition } =
    useMultitoolStore();
  const mobilePanelRef = useFocusTrap<HTMLDivElement>({
    active: mobileOpen,
    initialFocus: '#mobile-nav-close',
    clickOutsideDeactivates: false,
    escapeDeactivates: false,
  });

  useEffect(() => {
    setMegaMenuOpen(false);
    setMobileOpen(false);
    stableHeaderHeightRef.current = 0;
  }, [pathname]);

  const navGoalsEnabled = isFeatureEnabled('feature_nav_goals');
  const headerTrustEnabled = isFeatureEnabled('feature_header_trust');

  const lowestRental = Math.min(
    ...Object.values(TECH_DETAILS)
      .map((tech) => tech.rentalPrice)
      .filter((value): value is number => typeof value === 'number' && value > 0)
  );
  const trustMarkers = batch3NavigationContent.trustMarkers(lowestRental);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const springScaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });
  const scaleX = shouldReduceMotion ? scrollYProgress : springScaleX;

  useEffect(() => {
    const syncScrollState = () => {
      const latest = window.scrollY;
      const nextIsScrolled = latest > 20;
      const nextCompactHeader = latest > 96 && !mobileOpen && !megaMenuOpen && !multitoolOpen;

      setIsScrolled((previous) => (previous === nextIsScrolled ? previous : nextIsScrolled));
      setCompactHeader((previous) =>
        previous === nextCompactHeader ? previous : nextCompactHeader
      );
    };

    syncScrollState();
    window.addEventListener('scroll', syncScrollState, { passive: true });

    return () => {
      window.removeEventListener('scroll', syncScrollState);
    };
  }, [megaMenuOpen, mobileOpen, multitoolOpen, pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    window.addEventListener('resize', handleMobileMenuClose);
    return () => {
      window.removeEventListener('resize', handleMobileMenuClose);
    };
  }, [handleMobileMenuClose, mobileOpen]);

  useEffect(() => {
    if (mobileOpen || megaMenuOpen || multitoolOpen) {
      setCompactHeader(false);
    }
  }, [megaMenuOpen, mobileOpen, multitoolOpen]);

  useEffect(() => {
    const root = document.documentElement;
    let rafId: number | null = null;
    let animStartTime = 0;

    const syncHeaderOffset = (resetStableHeight = false) => {
      const navRect = navRef.current?.getBoundingClientRect();
      if (!navRect) {
        return;
      }

      const measuredHeight = Math.round(navRect.height);
      const measuredOffset = Math.round(navRect.bottom);
      const nextStableHeight = resetStableHeight
        ? measuredHeight
        : Math.max(stableHeaderHeightRef.current, measuredHeight);

      const nextHeight = `${measuredHeight}px`;
      const nextOffset = `${measuredOffset}px`;
      const nextStableHeightValue = `${nextStableHeight}px`;

      stableHeaderHeightRef.current = nextStableHeight;

      if (root.style.getPropertyValue('--route-header-height') !== nextHeight) {
        root.style.setProperty('--route-header-height', nextHeight);
      }

      if (root.style.getPropertyValue('--route-header-offset') !== nextOffset) {
        root.style.setProperty('--route-header-offset', nextOffset);
      }

      if (
        root.style.getPropertyValue('--route-header-stable-height') !== nextStableHeightValue
      ) {
        root.style.setProperty('--route-header-stable-height', nextStableHeightValue);
      }
    };

    // Smooth RAF loop to track the 300ms CSS padding transition frame-by-frame
    const runTransitionLoop = () => {
      animStartTime = performance.now();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      const step = (now: number) => {
        syncHeaderOffset(stableHeaderHeightRef.current === 0);
        if (now - animStartTime < 360) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = null;
          syncHeaderOffset(stableHeaderHeightRef.current === 0);
        }
      };

      rafId = requestAnimationFrame(step);
    };

    // Initial immediate measurement and start transition tracking
    syncHeaderOffset(stableHeaderHeightRef.current === 0);
    runTransitionLoop();

    const handleResize = () => {
      stableHeaderHeightRef.current = 0;
      syncHeaderOffset(true);
      runTransitionLoop();
    };

    const handleTransitionEvent = () => {
      syncHeaderOffset(stableHeaderHeightRef.current === 0);
    };

    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('transitionend', handleTransitionEvent);
      navElement.addEventListener('transitioncancel', handleTransitionEvent);
    }

    const observer =
      typeof ResizeObserver !== 'undefined' && navElement
        ? new ResizeObserver(() => {
            syncHeaderOffset(stableHeaderHeightRef.current === 0);
          })
        : null;

    if (observer && navElement) {
      observer.observe(navElement);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (navElement) {
        navElement.removeEventListener('transitionend', handleTransitionEvent);
        navElement.removeEventListener('transitioncancel', handleTransitionEvent);
      }
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [compactHeader, headerTrustEnabled, mobileOpen, pathname]);

  const navigate = (page: string) => {
    const href = resolveLegacyPagePath(page);
    if (!href) {
      return;
    }

    navigateWithScroll(router, href);
  };

  const navClasses = `fixed top-0 left-0 right-0 isolate border-b bg-[rgba(255,253,248,0.94)] text-slate-950 shadow-[0_4px_24px_rgba(0,0,0,0.03)] backdrop-blur-md backdrop-blur-xl transition-[padding,border-color,box-shadow] duration-300 motion-reduce:transition-none ${
    megaMenuOpen || mobileOpen ? 'z-[120]' : 'z-50'
  } ${
    compactHeader ? 'py-2 md:py-2.5' : 'py-3.5 sm:py-4'
  } ${
    isScrolled
      ? 'border-[var(--border-soft)] shadow-[0_12px_45px_rgba(71,85,105,0.10)]'
      : 'border-[rgba(232,223,210,0.78)]'
  }`;

  const handleExploreToggle = () => {
    primeMegaMenu();
    if (multitoolOpen) {
      toggleMultitool();
    }

    const nextMegaMenuOpen = !megaMenuOpen;
    setMegaMenuOpen(nextMegaMenuOpen);
    setHeaderActionStatus(nextMegaMenuOpen ? 'Explore menu opened.' : 'Explore menu closed.');
  };

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      handleMobileMenuClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMobileMenuClose, mobileOpen]);

  const handleAccessibilityClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (megaMenuOpen) {
      handleMegaMenuClose();
    }

    if (multitoolOpen) {
      toggleMultitool();
      setHeaderActionStatus('Accessibility tools closed from the header.');
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    openAtPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
    setHeaderActionStatus('Accessibility tools opened from the header.');
  };

  const handleMobileMenuToggle = () => {
    const nextMobileOpen = !mobileOpen;
    setMobileOpen(nextMobileOpen);
    setHeaderActionStatus(
      nextMobileOpen ? 'Mobile navigation menu opened.' : 'Mobile navigation menu closed.'
    );
  };

  const controlPanelUrl = resolvePublicControlPanelUrl(
    process.env.NEXT_PUBLIC_CONTROL_PANEL_URL,
    {
      environment: process.env.NODE_ENV,
      allowDevelopmentLocalLink: process.env.NEXT_PUBLIC_ENABLE_CONTROL_PANEL_LINK === 'true',
    }
  );

  return (
    // The fixed nav sits inside a plain <header> so every page exposes a banner landmark.
    <header data-testid="site-header-landmark">
    <motion.nav
      ref={navRef}
      data-testid="site-header"
      aria-label="Main navigation"
      className={navClasses}
      style={{
        backgroundColor: 'rgba(255, 253, 248, 0.94)',
        opacity: 1,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-white/55 pointer-events-none" />
      <p
        id={HEADER_ACTION_STATUS_ID}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Header action status"
      >
        {headerActionStatus}
      </p>
      <motion.div
        data-testid="header-scroll-progress"
        data-motion-mode="motion-value"
        className="absolute top-0 left-0 right-0 z-10 h-[2px] origin-left bg-gradient-to-r from-[var(--accent-oxygen)] via-[var(--accent-hydrogen)] to-[var(--accent-light)] shadow-[0_0_8px_rgba(47,159,179,0.28)]"
        style={{ scaleX }}
      />

      {headerTrustEnabled && !compactHeader && (
        <div className="relative z-20 border-b border-[var(--border-soft)] bg-white/35">
          <div className="mx-auto hidden max-w-7xl items-center justify-end gap-4 px-6 py-1 xl:flex">
            {trustMarkers.slice(0, 3).map((marker) => (
              <span
                key={marker}
                className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                {marker}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 xl:gap-8">
        <Link
          href="/"
          prefetch={false}
          data-testid="logo-link"
          className="group flex min-h-11 shrink-0 items-center gap-2 sm:gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
        >
          <Hexagon
            data-testid="header-logo-icon"
            className="text-[var(--accent-oxygen)] transition-transform duration-700 group-hover:rotate-180 motion-reduce:!transform-none motion-reduce:transition-none shrink-0"
            strokeWidth={1.5}
            size={compactHeader ? 20 : 24}
          />
          <div className="flex flex-col items-start shrink-0 transition-all duration-300">
            <span className="futuristic-font text-lg sm:text-xl md:text-2xl leading-none font-bold tracking-[0.06em] sm:tracking-[0.08em] text-slate-950 whitespace-nowrap">
              HYLONO
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-slate-500 transition-colors group-hover:text-[var(--accent-oxygen)]">
              Studio
            </span>
          </div>
        </Link>

        <div
          className={`hidden items-center xl:flex xl:flex-1 xl:justify-center ${
            compactHeader ? 'gap-6 xl:gap-8' : 'gap-8 xl:gap-10'
          }`}
        >
          <NavLink
            label="Concept"
            target="home"
            currentPage={currentPage}
          />

          {navGoalsEnabled && (
            <Link
              href={resolveLegacyPagePath('conditions') ?? '/conditions'}
              prefetch={false}
              className="group relative inline-flex min-h-11 items-center whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300 text-slate-600 hover:text-slate-950 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              {batch3NavigationContent.goalsLabel}
            </Link>
          )}

          <button
            type="button"
            onMouseEnter={primeMegaMenu}
            onClick={handleExploreToggle}
            aria-haspopup="dialog"
            aria-expanded={megaMenuOpen}
            aria-controls={megaMenuOpen ? 'site-mega-menu' : undefined}
            aria-describedby={HEADER_ACTION_STATUS_ID}
            onFocus={() => setHeaderActionStatus('Explore menu is ready to open.')}
            className={`group flex min-h-11 items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
              megaMenuOpen
                ? 'text-cyan-600 font-bold'
                : 'text-slate-600 hover:text-slate-950 hover:-translate-y-0.5'
            } outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300`}
          >
            Explore{' '}
            <ChevronDown
              size={13}
              className={`transition-transform duration-300 motion-reduce:transition-none ${
                megaMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <NavLink
            label="Store"
            target="store"
            currentPage={currentPage}
          />
          <NavLink
            label="Contact"
            target="contact"
            currentPage={currentPage}
          />
        </div>

        <MegaMenu
          isOpen={megaMenuOpen}
          onClose={handleMegaMenuClose}
          onNavigate={(page, techId) => {
            handleMegaMenuClose();
            if (techId) {
              navigateWithScroll(router, `/product/${techId.toLowerCase()}`);
              return;
            }
            navigate(page);
          }}
        />

        <div className="hidden items-center gap-3 xl:ml-auto xl:flex">
          <GlobalSearch onNavigate={navigate} onOpen={handleGlobalSearchOpen} />

          <button
            type="button"
            onClick={handleAccessibilityClick}
            className={`group flex h-11 items-center gap-2 rounded-lg border px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              multitoolOpen
                ? 'border-cyan-500/50 bg-cyan-50 text-cyan-700'
                : 'border-[var(--border-soft)] bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950 shadow-xs'
            }`}
            aria-label="Open accessibility tools"
            aria-haspopup="dialog"
            aria-expanded={multitoolOpen}
            aria-controls={multitoolOpen ? 'multitool-accessibility-tools' : undefined}
            aria-describedby={HEADER_ACTION_STATUS_ID}
            onFocus={() =>
              setHeaderActionStatus('Accessibility tools are ready to open from the header.')
            }
          >
            <Accessibility size={18} className="shrink-0 transition-transform group-hover:scale-110" />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 group-hover:text-slate-950">
              Access
            </span>
          </button>

          {controlPanelUrl && (
            <Link
              href={controlPanelUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex h-11 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-white px-3 text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Open control panel"
              aria-describedby={HEADER_ACTION_STATUS_ID}
              onFocus={() => setHeaderActionStatus('Control panel link is ready.')}
              onClick={() =>
                setHeaderActionStatus('Opening control panel in a new tab.')
              }
            >
              <SlidersHorizontal size={18} className="shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 group-hover:text-slate-950">
                Panel
              </span>
            </Link>
          )}

          <CartIcon href="/checkout" onClick={handleCartCheckout} ariaLabel="Open checkout" />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 xl:hidden">
          {!mobileOpen && (
            <>
              <Link
                href={resolveLegacyPagePath('store') ?? '/store'}
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="hidden min-h-11 items-center rounded-lg border border-[var(--border-soft)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:inline-flex"
              >
                Store
              </Link>
              <GlobalSearch onNavigate={navigate} onOpen={handleGlobalSearchOpen} />
              <button
                type="button"
                onClick={handleAccessibilityClick}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  multitoolOpen
                    ? 'border-cyan-500/50 bg-cyan-50 text-cyan-700'
                    : 'border-[var(--border-soft)] bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950 shadow-xs'
                }`}
                aria-label="Open accessibility tools"
                aria-haspopup="dialog"
                aria-expanded={multitoolOpen}
                aria-controls={multitoolOpen ? 'multitool-accessibility-tools' : undefined}
                aria-describedby={HEADER_ACTION_STATUS_ID}
                onFocus={() =>
                  setHeaderActionStatus('Accessibility tools are ready to open from the header.')
                }
              >
                <Accessibility size={18} />
              </button>
              <CartIcon href="/checkout" onClick={handleCartCheckout} ariaLabel="Open checkout" />
            </>
          )}
          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-white text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? 'mobile-nav-panel' : undefined}
            aria-describedby={HEADER_ACTION_STATUS_ID}
            onFocus={() =>
              setHeaderActionStatus(
                mobileOpen
                  ? 'Close navigation menu is ready.'
                  : 'Open navigation menu is ready.'
              )
            }
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobilePanelRef}
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full z-[55] flex h-[calc(100vh_-_var(--route-header-offset,0px))] w-full flex-col gap-6 overflow-y-auto overscroll-contain border-b border-slate-200/80 bg-white/95 backdrop-blur-2xl p-6 sm:p-8 pb-20 text-slate-950 xl:hidden custom-scrollbar shadow-2xl transition-all duration-300"
            style={{
              opacity: 1,
            }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-4">
              <h2
                id="mobile-nav-title"
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-oxygen)]"
              >
                Navigation
              </h2>
              <button
                id="mobile-nav-close"
                type="button"
                onClick={handleMobileMenuClose}
                className="min-h-11 min-w-11 rounded-lg border border-[var(--border-soft)] bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white flex items-center justify-center"
                aria-label="Close navigation menu"
                aria-describedby={HEADER_ACTION_STATUS_ID}
                onFocus={() => setHeaderActionStatus('Close navigation menu is ready.')}
              >
                <X size={18} />
              </button>
            </div>

            {headerTrustEnabled && (
              <div className="space-y-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 p-3">
                {trustMarkers.slice(0, 2).map((marker) => (
                  <p
                    key={marker}
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600"
                  >
                    {marker}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <NavLink
                label="Concept"
                target="home"
                currentPage={currentPage}
                onClick={handleMobileMenuClose}
                variant="mobile"
              />
              {navGoalsEnabled && (
                <NavLink
                  label="Goals"
                  target="conditions"
                  currentPage={currentPage}
                  onClick={handleMobileMenuClose}
                  variant="mobile"
                />
              )}
              <NavLink
                label="Store"
                target="store"
                currentPage={currentPage}
                onClick={handleMobileMenuClose}
                variant="mobile"
              />
              <NavLink
                label="Ecosystem"
                target="tech"
                currentPage={currentPage}
                onClick={handleMobileMenuClose}
                variant="mobile"
              />
              <NavLink
                label="Contact"
                target="contact"
                currentPage={currentPage}
                onClick={handleMobileMenuClose}
                variant="mobile"
              />
            </div>

            {navGoalsEnabled && (
              <div className="space-y-1.5 border-t border-[var(--border-soft)] pt-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400 mb-2 font-semibold">
                  Wellness Goals
                </p>
                {batch3NavigationContent.goals.map((goal) => (
                  <Link
                    key={goal.path}
                    href={resolveLegacyPagePath(goal.path) ?? '/conditions'}
                    prefetch={false}
                    onClick={handleMobileMenuClose}
                    className="flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs uppercase tracking-[0.12em] text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    <span>{goal.label}</span>
                    <ArrowRight size={13} className="text-slate-400" />
                  </Link>
                ))}
              </div>
            )}

            {!announcementDismissed && (
              <button
                type="button"
                onClick={() => {
                  setAnnouncementDismissed(true);
                  try {
                    window.localStorage.setItem(
                      'hylono_announcement_dismissed',
                      'true'
                    );
                  } catch {
                    // ignore localStorage failures
                  }
                }}
                className="mt-2 min-h-11 rounded-lg border border-[var(--border-soft)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                aria-describedby={HEADER_ACTION_STATUS_ID}
                onFocus={() => setHeaderActionStatus('Dismiss announcement is ready.')}
              >
                Dismiss announcement
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </header>
  );
}
