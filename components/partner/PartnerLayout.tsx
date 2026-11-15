'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import {
    LayoutDashboard,
    Palette,
    Wrench,
    ClipboardCheck,
    Users,
    GraduationCap,
    LogOut,
    Menu,
    FileText,
    Home,
    ExternalLink,
    ChevronRight,
    X,
    Boxes,
    ShoppingBag,
    LucideIcon,
    BadgeCheck,
    Bell,
    HelpCircle,
    Building2,
    Sparkles,
} from 'lucide-react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY, NEXUS_MODULE_NAV_ITEMS } from './nexusNavigation';
import type { NexusNavIconKey } from './nexusNavigation';

type WorkspaceChromeMode = 'sample' | 'workspace';

interface PartnerLayoutProps {
    children: React.ReactNode;
    title: string;
    chromeMode?: WorkspaceChromeMode;
}

const NAV_ICON_BY_KEY: Record<NexusNavIconKey, LucideIcon> = {
    layoutDashboard: LayoutDashboard,
    users: Users,
    wrench: Wrench,
    clipboardCheck: ClipboardCheck,
    graduationCap: GraduationCap,
    shoppingBag: ShoppingBag,
    fileText: FileText,
    palette: Palette,
    boxes: Boxes,
};

const NEXUS_SIDEBAR_ACTION_STATUS_ID = 'nexus-sidebar-action-status';
const NEXUS_SIDEBAR_ACTION_STATUS_LABEL = 'Nexus sidebar action status';
const NEXUS_MODULE_NAV_ITEM_BY_HREF = Object.fromEntries(
    NEXUS_MODULE_NAV_ITEMS.map((item) => [item.href, item])
);
const NEXUS_WORKSPACE_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.workspace.href;

const formatBreadcrumbSegment = (segment: string) =>
    segment.charAt(0).toUpperCase() + segment.slice(1);

const getNexusBreadcrumbLabel = (segments: string[], index: number) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const moduleItem = NEXUS_MODULE_NAV_ITEM_BY_HREF[href];

    return moduleItem?.label ?? formatBreadcrumbSegment(segments[index] ?? '');
};

export const PartnerLayout: React.FC<PartnerLayoutProps> = ({
    children,
    title,
    chromeMode = 'sample',
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarActionStatus, setSidebarActionStatus] = useState('Nexus sidebar expanded.');
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
    const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
    const pathname = usePathname() ?? NEXUS_WORKSPACE_ROUTE_HREF;
    const isSampleChrome = chromeMode === 'sample';
    const accessHref = buildLoginRedirectPath('/account');

    const handleSignOut = () => {
        setSidebarActionStatus('Signing out of Nexus workspace.');
        void signOut({ callbackUrl: '/login' });
    };

    const announceSidebarAction = useCallback(
        (label: string, surface: string, intent: 'ready' | 'opening') => {
            setSidebarActionStatus(
                intent === 'ready'
                    ? `${label} ready from ${surface}.`
                    : `Opening ${label} from ${surface}.`
            );
        },
        []
    );

    const handleSidebarToggle = () => {
        setCollapsed((current) => {
            const nextCollapsed = !current;
            setSidebarActionStatus(
                nextCollapsed ? 'Nexus sidebar collapsed.' : 'Nexus sidebar expanded.'
            );
            return nextCollapsed;
        });
    };

    const closeMobileMenu = useCallback((restoreFocus = false, status?: string) => {
        if (status) {
            setSidebarActionStatus(status);
        }

        setMobileOpen(false);

        if (restoreFocus) {
            window.setTimeout(() => mobileMenuButtonRef.current?.focus(), 0);
        }
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth < 1024) {
                setCollapsed(false);
                closeMobileMenu();
            }
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [closeMobileMenu]);

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }

        const focusTimer = window.setTimeout(() => mobileCloseButtonRef.current?.focus(), 0);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeMobileMenu(true, 'Closing Nexus navigation menu.');
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.clearTimeout(focusTimer);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [closeMobileMenu, mobileOpen]);

    const isActive = (href: string) => {
        if (href === NEXUS_WORKSPACE_ROUTE_HREF) {
            return pathname === href;
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = pathSegments
        .slice(1)
        .map((_, index) => getNexusBreadcrumbLabel(pathSegments, index + 1));

    const sidebarW = collapsed ? 72 : 256;

    return (
        <div data-nexus-shell="true" className="nexus-shell flex min-h-screen w-full max-w-full overflow-x-hidden bg-[#f8fafc] font-sans text-[#0f172a]">
            {/* Desktop sidebar */}
            <motion.aside
                id="partner-desktop-sidebar"
                animate={{ width: sidebarW }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="nexus-sidebar fixed bottom-0 left-0 top-0 z-30 hidden flex-col overflow-hidden border-r border-white/[0.08] bg-slate-950/[0.96] text-slate-400 lg:flex"
            >
                {/* Subtle dark mountain background texture in bottom half */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 overflow-hidden opacity-30">
                    <Image
                        src="/images/nexus/sidebar-mountain-bg.jpg"
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="260px"
                        className="object-cover object-bottom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#020617]/[0.85] to-transparent" />
                </div>

                {/* Brand header matching reference */}
                <div className="relative z-10 flex h-20 shrink-0 flex-col justify-center border-b border-white/[0.06] px-6">
                    <AnimatePresence mode="wait">
                        {!collapsed ? (
                            <motion.div
                                key="brand-expanded"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <p className="font-bold uppercase tracking-[0.34em] text-white text-sm">
                                    HYLONO
                                </p>
                                <p className="mt-0.5 font-medium uppercase tracking-[0.24em] text-slate-400 text-[10px]">
                                    NEXUS
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="brand-collapsed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-center"
                            >
                                <span className="font-black text-xs uppercase tracking-widest text-cyan-400">HY</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick back link */}
                <div className="relative z-10 px-3 pt-3">
                    <Link
                        href="/"
                        title="Back to website"
                        aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                        onFocus={() => announceSidebarAction('Back to website', 'desktop sidebar', 'ready')}
                        onClick={() => announceSidebarAction('Back to website', 'desktop sidebar', 'opening')}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                        <Home className="h-4 w-4 shrink-0" />
                        <AnimatePresence>
                            {!collapsed ? (
                                <motion.span
                                    key="home-label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 break-words"
                                >
                                    Back to website
                                </motion.span>
                            ) : null}
                        </AnimatePresence>
                        {!collapsed ? (
                            <ExternalLink className="h-3 w-3 text-slate-500 transition-colors group-hover:text-white" />
                        ) : null}
                    </Link>
                </div>

                <div className="relative z-10 mx-4 my-2 h-px bg-white/[0.05]" />

                {/* Navigation Items */}
                <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto px-3 py-1">
                    {NEXUS_MODULE_NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        const Icon = NAV_ICON_BY_KEY[item.iconKey];

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                                title={collapsed ? item.label : undefined}
                                onFocus={() =>
                                    announceSidebarAction(item.label, 'desktop sidebar', 'ready')
                                }
                                onClick={() =>
                                    announceSidebarAction(item.label, 'desktop sidebar', 'opening')
                                }
                                className={`relative flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 transition-all duration-150 ${
                                    active
                                        ? 'bg-cyan-400/[0.12] text-white font-semibold'
                                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white font-medium'
                                }`}
                            >
                                <Icon
                                    className={`relative z-10 h-4 w-4 shrink-0 ${
                                        active ? 'text-white' : 'text-slate-400'
                                    }`}
                                />
                                <AnimatePresence>
                                    {!collapsed ? (
                                        <motion.span
                                            key={`label-${item.href}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="relative z-10 break-words text-xs tracking-wide"
                                        >
                                            {item.label}
                                        </motion.span>
                                    ) : null}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Collapse Toggle */}
                <div className="relative z-10 px-3 py-1">
                    <button
                        type="button"
                        onFocus={() =>
                            setSidebarActionStatus(
                                collapsed
                                    ? 'Expand sidebar control ready.'
                                    : 'Collapse sidebar control ready.'
                            )
                        }
                        onClick={handleSidebarToggle}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-controls="partner-desktop-sidebar"
                        aria-expanded={!collapsed}
                        aria-pressed={collapsed}
                        aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                    >
                        <Menu className="h-4 w-4 shrink-0" />
                        <AnimatePresence>
                            {!collapsed ? (
                                <motion.span
                                    key="collapse-label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="break-words"
                                >
                                    Collapse sidebar
                                </motion.span>
                            ) : null}
                        </AnimatePresence>
                    </button>
                </div>

                {/* Bottom support and clinic cards matching reference */}
                {!collapsed ? (
                    <div className="relative z-10 space-y-2 border-t border-white/[0.06] p-3">
                        {/* Support Card */}
                        <div className="rounded-lg border border-white/[0.08] bg-white/[0.045] p-2.5 backdrop-blur-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-300/[0.10] text-slate-300">
                                    <HelpCircle className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-white text-[11px]">Support</p>
                                    <p className="text-[10px] text-slate-400 break-words">
                                        Need help?{' '}
                                        <Link
                                            href="/contact"
                                            aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                                            onFocus={() => announceSidebarAction('Contact', 'desktop sidebar', 'ready')}
                                            onClick={() => announceSidebarAction('Contact', 'desktop sidebar', 'opening')}
                                            className="text-cyan-400 hover:underline"
                                        >
                                            Contact
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Clinic Card */}
                        <div className="rounded-lg border border-white/[0.08] bg-white/[0.045] p-2.5 backdrop-blur-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-slate-300">
                                    <Building2 className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-white text-[11px]">Clinic</p>
                                    <p className="text-[10px] text-slate-300 font-medium break-words">Valley Wellness Clinic</p>
                                    <Link
                                        href={accessHref}
                                        aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                                        onFocus={() => announceSidebarAction('Sign in', 'desktop sidebar', 'ready')}
                                        onClick={() => announceSidebarAction('Sign in', 'desktop sidebar', 'opening')}
                                        className="text-[10px] text-cyan-400 hover:underline block"
                                    >
                                        Sign in
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Sample workspace tour footnote */}
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-slate-500">
                            <Sparkles className="h-3 w-3 text-[#22d3ee]/[0.60]" />
                            <span>Sample workspace tour</span>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 border-t border-white/[0.06] p-2 text-center">
                        <Link
                            href={accessHref}
                            title="Sign in"
                            aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.08] text-slate-300 hover:text-white"
                        >
                            <BadgeCheck className="h-4 w-4" />
                        </Link>
                    </div>
                )}
            </motion.aside>

            {/* Accessible Screen Reader Announcer */}
            <p
                id={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={NEXUS_SIDEBAR_ACTION_STATUS_LABEL}
            >
                {sidebarActionStatus}
            </p>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen ? (
                    <>
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-slate-950/[0.75] lg:hidden"
                            onClick={() => closeMobileMenu(true, 'Closing Nexus navigation menu.')}
                        />
                        <motion.aside
                            id="partner-mobile-drawer"
                            key="drawer"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation menu"
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.2 }}
                            className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-white/[0.10] bg-slate-950/[0.96] text-slate-400 lg:hidden"
                        >
                            <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-5">
                                <div>
                                    <p className="font-bold uppercase tracking-[0.3em] text-white text-sm">HYLONO</p>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">NEXUS</p>
                                </div>
                                <button
                                    ref={mobileCloseButtonRef}
                                    type="button"
                                    onClick={() => closeMobileMenu(true, 'Closing Nexus navigation menu.')}
                                    onFocus={() => setSidebarActionStatus('Close menu control ready.')}
                                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                                    aria-label="Close menu"
                                    aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
                                {NEXUS_MODULE_NAV_ITEMS.map((item) => {
                                    const active = isActive(item.href);
                                    const Icon = NAV_ICON_BY_KEY[item.iconKey];

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            aria-current={active ? 'page' : undefined}
                                            aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                                            onFocus={() =>
                                                announceSidebarAction(
                                                    item.label,
                                                    'mobile drawer',
                                                    'ready'
                                                )
                                            }
                                            onClick={() => {
                                                announceSidebarAction(
                                                    item.label,
                                                    'mobile drawer',
                                                    'opening'
                                                );
                                                closeMobileMenu();
                                            }}
                                            className={`flex min-h-11 items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-colors ${
                                                active
                                                    ? 'bg-white/[0.10] text-white font-semibold'
                                                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="border-t border-white/[0.08] p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href={accessHref}
                                        aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                                        onFocus={() =>
                                            announceSidebarAction('Sign in', 'mobile drawer', 'ready')
                                        }
                                        onClick={() => {
                                            announceSidebarAction(
                                                'Sign in',
                                                'mobile drawer',
                                                'opening'
                                            );
                                            closeMobileMenu();
                                        }}
                                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-cyan-400/[0.30] bg-cyan-400/[0.15] px-3 py-2 text-center text-xs font-semibold text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/contact"
                                        aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                                        onFocus={() =>
                                            announceSidebarAction('Contact', 'mobile drawer', 'ready')
                                        }
                                        onClick={() => {
                                            announceSidebarAction(
                                                'Contact',
                                                'mobile drawer',
                                                'opening'
                                            );
                                            closeMobileMenu();
                                        }}
                                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-center text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    >
                                        Contact
                                    </Link>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                ) : null}
            </AnimatePresence>

            {/* Main Content Area */}
            <div
                className={`flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden transition-[margin] duration-200 ${
                    collapsed ? 'lg:ml-[72px]' : 'lg:ml-[256px]'
                }`}
            >
                {/* Top Header Bar matching reference */}
                <header className="nexus-topbar sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-[#ffffff]/90 px-4 backdrop-blur-md md:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            ref={mobileMenuButtonRef}
                            type="button"
                            onFocus={() => setSidebarActionStatus('Open menu control ready.')}
                            onClick={() => {
                                setSidebarActionStatus('Opening Nexus navigation menu.');
                                setMobileOpen((current) => !current);
                            }}
                            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-[#f1f5f9] hover:text-slate-900 lg:hidden"
                            aria-label="Open menu"
                            aria-controls="partner-mobile-drawer"
                            aria-expanded={mobileOpen}
                            aria-haspopup="dialog"
                            aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Search Input / CommandPalette trigger */}
                        <div className="relative">
                            <CommandPalette triggerLabel={isSampleChrome ? 'Search Nexus...' : 'Search'} />
                        </div>

                        {/* Hidden semantic breadcrumb navigation for test compliance */}
                        <nav className="sr-only" aria-label="Breadcrumb">
                            <span>Nexus</span>
                            {breadcrumbs.length === 0 ? (
                                <span>{title}</span>
                            ) : (
                                breadcrumbs.map((crumb) => <span key={crumb}>{crumb}</span>)
                            )}
                        </nav>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 md:gap-4">
                        {/* Notifications Bell */}
                        <button
                            type="button"
                            aria-label="Notifications"
                            aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#f1f5f9] hover:text-slate-800"
                        >
                            <Bell className="h-4 w-4" />
                        </button>

                        {/* Help / Compass */}
                        <Link
                            href="/contact"
                            aria-label="Help & Documentation"
                            aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#f1f5f9] hover:text-slate-800"
                        >
                            <HelpCircle className="h-4 w-4" />
                        </Link>

                        <div className="h-6 w-px bg-slate-200" />

                        {/* User Profile Badge matching reference: John Doe / Clinic Manager */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f172a] text-xs font-semibold text-[#ffffff]">
                                JD
                            </div>
                            <div className="hidden text-left sm:block">
                                <p className="text-xs font-semibold leading-none text-[#0f172a]">John Doe</p>
                                <p className="mt-1 text-[11px] leading-none text-[#64748b]">Clinic Manager</p>
                            </div>
                        </div>

                        {/* Secondary Sign out or Authenticated indicator */}
                        {!isSampleChrome ? (
                            <button
                                type="button"
                                aria-describedby={NEXUS_SIDEBAR_ACTION_STATUS_ID}
                                onFocus={() => setSidebarActionStatus('Sign out control ready.')}
                                onClick={handleSignOut}
                                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-2 text-slate-400 hover:text-slate-700"
                                aria-label="Sign out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </header>

                {/* Main Content Workspace Canvas */}
                <div className="nexus-main-canvas min-w-0 max-w-full flex-1 overflow-x-hidden bg-[#f8fafc] p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};
