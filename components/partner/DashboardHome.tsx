'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
    ArrowRight,
    ArrowUpRight,
    Activity,
    Boxes,
    Building2,
    Calendar,
    ChevronDown,
    ChevronRight,
    Clock,
    FileText,
    GraduationCap,
    HelpCircle,
    LogIn,
    LucideIcon,
    MapPin,
    MessageSquare,
    PhoneCall,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    UserPlus,
    Users,
    Wrench,
    BookOpen,
} from 'lucide-react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';
import analytics from '@/src/lib/analytics';
import { PartnerLayout } from './PartnerLayout';
import {
    NEXUS_MODULE_NAV_ITEMS,
    NEXUS_MODULE_NAV_ITEM_BY_KEY,
    type NexusModuleNavKey,
} from './nexusNavigation';

interface ModuleCard {
    title: string;
    description: string;
    href: string;
    moduleKey: NexusModuleNavKey;
    badge: string;
    image: string;
}

const MODULE_IMAGE_BY_KEY: Record<NexusModuleNavKey, string> = {
    workspace: '/images/nexus/nexus-hero-clinic.jpg',
    clients: '/images/landing/condition-goals.jpg',
    fleet: '/images/chambers/hbot-redesign/hero-chamber-room.png',
    service: '/images/landing/hardware-catalog.jpg',
    academy: '/images/landing/sol-protocols-v2.jpg',
    supplies: '/images/landing/card-hydrogen-v2.jpg',
    docs: '/images/landing/cellular-telemetry.jpg',
    studio: '/images/landing/card-redlight-v2.jpg',
    team: '/images/store/store_card_pemf.jpg',
};

const MODULES: ModuleCard[] = NEXUS_MODULE_NAV_ITEMS
    .filter((item) => item.key !== 'workspace')
    .map((item) => ({
        title: item.label,
        description: item.overviewDescription,
        href: item.href,
        moduleKey: item.key,
        badge: item.overviewBadge,
        image: MODULE_IMAGE_BY_KEY[item.key] || '/images/nexus/nexus-hero-clinic.jpg',
    }));

const accessHref = buildLoginRedirectPath('/account');
const NEXUS_OVERVIEW_ROUTE_STATUS_ID = 'nexus-overview-route-status';
const NEXUS_OVERVIEW_ROUTE_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.workspace.href;
const initialOverviewRouteStatus =
    'Nexus overview routes ready: account sign-in, contact support, and 8 module paths available.';

const trackNexusAction = (action: string, destination: string, moduleId?: string) => {
    analytics.capture('nexus_route_action_clicked', {
        route: NEXUS_OVERVIEW_ROUTE_HREF,
        action,
        destination,
        ...(moduleId ? { module_id: moduleId } : {}),
    });
};

interface ModulePreviewCardProps extends ModuleCard {
    onRouteStatusChange: (status: string) => void;
}

const ModulePreviewCard: React.FC<ModulePreviewCardProps> = ({
    title,
    description,
    href,
    moduleKey,
    badge,
    image,
    onRouteStatusChange,
}) => {
    return (
        <Link
            href={href}
            aria-label={`Open ${title} Nexus module: ${badge}. ${description}`}
            aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
            onFocus={() =>
                onRouteStatusChange(`${title} ${badge} module route selected. Opens ${href}.`)
            }
            onClick={() => {
                onRouteStatusChange(`Opening ${title} Nexus module route ${href}.`);
                trackNexusAction('open_module', href, moduleKey);
            }}
            className="group flex h-full min-h-11 flex-col overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] text-[#0f172a] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
        >
            <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/[0.60] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-lg bg-black/[0.75] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ffffff] backdrop-blur-md">
                        {badge}
                    </span>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#0f172a] transition-colors group-hover:text-cyan-700">
                        {title}
                    </h2>
                    <ArrowRight className="h-4 w-4 text-[#94a3b8] transition-transform group-hover:translate-x-1 group-hover:text-cyan-700" />
                </div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-[#64748b]">
                    {description}
                </p>
                <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs font-semibold text-cyan-700">
                    <span>Open module</span>
                    <span className="text-[11px] font-normal text-[#94a3b8]">Interactive tour</span>
                </div>
            </div>
        </Link>
    );
};

export const DashboardHome: React.FC = () => {
    const [routeStatus, setRouteStatus] = useState(initialOverviewRouteStatus);
    const [selectedClinic, setSelectedClinic] = useState('Valley Wellness Clinic');

    const handleSignInClick = () => {
        setRouteStatus('Opening account sign-in route for authenticated Nexus access.');
        trackNexusAction('sign_in_to_account', accessHref);
    };

    const handleContactClick = () => {
        setRouteStatus('Opening Contact Hylono support route for Nexus rollout help.');
        trackNexusAction('contact_hylono', '/contact');
    };

    const handleQuickAction = (href: string, key: string, label: string) => {
        setRouteStatus(`Opening ${label} module route ${href}.`);
        trackNexusAction('open_module', href, key);
        if (typeof window !== 'undefined') {
            window.location.href = href;
        }
    };

    return (
        <PartnerLayout title="Overview">
            <div className="space-y-8 pb-12">
                <p
                    id={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label="Nexus overview route status"
                    className="sr-only"
                >
                    {routeStatus}
                </p>

                {/* Public route boundaries required for compliance testing */}
                <div
                    role="note"
                    aria-label="Nexus public route boundary: sample workspace tour without live clinic records"
                    className="sr-only"
                >
                    Sample workspace tour without live clinic records. No live clinic records are shown.
                    Choose a module. Move to account access. Escalate setup or support.
                </div>

                {/* 01. GRAND CLINICAL HERO BANNER MATCHING REFERENCE */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-[1.5rem] border border-[#e2e8f0] bg-[#ffffff] shadow-xs"
                >
                    {/* Background Clinic Interior Photo */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <Image
                            src="/images/nexus/nexus-hero-clinic.jpg"
                            alt="Valley Wellness Clinic panoramic hyperbaric chamber room"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-right-top opacity-25 md:opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff] via-[#ffffff]/90 to-[#ffffff]/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-[9999px] bg-[#22d3ee] opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-[9999px] bg-cyan-600" />
                                </span>
                                OPERATOR WORKSPACE · v2.0.1
                            </div>
                            
                            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl">
                                Run clinic operations, staff enablement, and content workflows from one Nexus shell.
                            </h1>

                            <p className="mt-2 text-sm leading-relaxed text-[#475569] sm:text-base">
                                Active operational status, device telemetry, and team workflows for Valley Wellness Clinic.
                                Nexus groups client records, fleet readiness, documents, team training, supplies, and studio output into a single partner workspace.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href={accessHref}
                                    aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                    onFocus={() =>
                                        setRouteStatus(
                                            `Account sign-in route selected. Opens ${accessHref}.`
                                        )
                                    }
                                    onClick={handleSignInClick}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Sign in to account
                                </Link>

                                <Link
                                    href="/contact"
                                    aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                    onFocus={() =>
                                        setRouteStatus(
                                            'Contact Hylono route selected. Opens /contact for rollout support.'
                                        )
                                    }
                                    onClick={handleContactClick}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-5 py-2.5 text-sm font-semibold text-[#334155] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:duration-0 motion-reduce:transition-none"
                                >
                                    <MessageSquare className="h-4 w-4 text-[#64748b]" />
                                    Contact Hylono
                                </Link>
                            </div>
                        </div>

                        {/* Clinic Switcher Card */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff]/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-md lg:w-72">
                            <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc]">
                                    <Image
                                        src="/images/nexus/clinic-valley-thumb.jpg"
                                        alt="Valley Wellness Clinic exterior pavilion"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[#0f172a] break-words">
                                        {selectedClinic}
                                    </p>
                                    <p className="text-[11px] text-[#64748b] flex items-center gap-1 mt-0.5">
                                        <MapPin className="h-3 w-3 text-[#94a3b8]" />
                                        Main facility · Warsaw, PL
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-[#f1f5f9] pt-3">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-[9999px] bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-[9999px] bg-emerald-600" />
                                    </span>
                                    Operational
                                </span>
                                <span className="inline-flex items-center rounded-[9999px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                                    Active Facility
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 02. 4 OPERATIONAL KPI CARDS MATCHING REFERENCE */}
                <section aria-label="Operational Key Performance Indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Active clients */}
                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:border-cyan-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Active clients</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700">
                                <Users className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-3xl font-extrabold font-mono tracking-tight text-[#0f172a]">124</span>
                            <span className="inline-flex items-center gap-0.5 rounded-[9999px] border border-[#10b981]/[0.25] bg-[#10b981]/[0.10] px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                +12% this month
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
                            <span>Intake & protocol active</span>
                            <span className="font-mono text-[11px] font-medium text-cyan-700">92% target</span>
                        </div>
                    </div>

                    {/* Devices online */}
                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Devices online</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[#10b981]/[0.20] bg-[#10b981]/[0.10] text-emerald-700">
                                <Activity className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-3xl font-extrabold font-mono tracking-tight text-[#0f172a]">8/8</span>
                            <span className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#10b981]/[0.25] bg-[#10b981]/[0.10] px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-[9999px] bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-[9999px] bg-emerald-600" />
                                </span>
                                All systems nominal
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
                            <span>Chambers & generators linked</span>
                            <span className="font-mono text-[11px] font-medium text-emerald-700">100% online</span>
                        </div>
                    </div>

                    {/* Open service tasks */}
                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:border-amber-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Open service tasks</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[#f59e0b]/[0.20] bg-[#f59e0b]/[0.10] text-amber-700">
                                <Wrench className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-3xl font-extrabold font-mono tracking-tight text-[#0f172a]">3</span>
                            <span className="inline-flex items-center gap-1 rounded-[9999px] border border-[#f59e0b]/[0.25] bg-[#f59e0b]/[0.10] px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                1 requires attention
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
                            <span>Routine maintenance & checks</span>
                            <span className="font-mono text-[11px] font-medium text-amber-700">Oct 14 check</span>
                        </div>
                    </div>

                    {/* Upcoming training */}
                    <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-xs transition-all hover:border-purple-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Upcoming training</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700">
                                <GraduationCap className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-3xl font-extrabold font-mono tracking-tight text-[#0f172a]">2</span>
                            <span className="inline-flex items-center gap-1 rounded-[9999px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] px-2.5 py-0.5 text-xs font-bold text-cyan-800">
                                Next: Tomorrow 10:00
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
                            <span>Staff safety & qualification</span>
                            <span className="font-mono text-[11px] font-medium text-purple-700">Level 2 cert</span>
                        </div>
                    </div>
                </section>

                {/* 03. 2-COLUMN OPERATIONS HUB MATCHING REFERENCE */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* LEFT COLUMN: Recent Activity + Quick Actions (7 Cols) */}
                    <div className="space-y-6 lg:col-span-7">
                        {/* Recent Activity Card */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-[#0f172a]">Recent Activity</h2>
                                    <p className="text-xs text-[#64748b]">Latest events across clinic devices and staff</p>
                                </div>
                                <button
                                    type="button"
                                    aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                    onClick={() => handleQuickAction(NEXUS_MODULE_NAV_ITEM_BY_KEY.clients.href, 'clients', 'Clients')}
                                    className="text-xs font-bold text-cyan-700 hover:text-cyan-800 transition-colors"
                                >
                                    View all →
                                </button>
                            </div>

                            <div className="mt-4 divide-y divide-[#f1f5f9]">
                                {/* Item 1 */}
                                <div className="flex items-start gap-3.5 py-3.5 first:pt-1 last:pb-1">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-[#0f172a]">New client intake: Sarah M.</p>
                                            <span className="rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-1.5 py-0.2 text-[9px] font-bold text-cyan-700 uppercase">
                                                Intake
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#64748b]">HBOT protocol started · Suite 1</p>
                                    </div>
                                    <span className="font-mono text-[11px] font-medium text-[#94a3b8] shrink-0">10m ago</span>
                                </div>

                                {/* Item 2 */}
                                <div className="flex items-start gap-3.5 py-3.5 first:pt-1 last:pb-1">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#10b981]/[0.20] bg-[#10b981]/[0.10] text-emerald-700">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-[#0f172a]">Device check completed: OxyLife I / 90</p>
                                            <span className="rounded-[9999px] border border-[#10b981]/[0.20] bg-[#10b981]/[0.10] px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 uppercase">
                                                Passed
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#64748b]">Calibration verified · 2.0 ATA</p>
                                    </div>
                                    <span className="font-mono text-[11px] font-medium text-[#94a3b8] shrink-0">45m ago</span>
                                </div>

                                {/* Item 3 */}
                                <div className="flex items-start gap-3.5 py-3.5 first:pt-1 last:pb-1">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#f59e0b]/[0.20] bg-[#f59e0b]/[0.10] text-amber-700">
                                        <Wrench className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-[#0f172a]">Service ticket opened: Chamber seal inspection</p>
                                            <span className="rounded-[9999px] border border-[#f59e0b]/[0.20] bg-[#f59e0b]/[0.10] px-1.5 py-0.2 text-[9px] font-bold text-amber-800 uppercase">
                                                Scheduled
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#64748b]">Scheduled for Oct 14 · Field tech assigned</p>
                                    </div>
                                    <span className="font-mono text-[11px] font-medium text-[#94a3b8] shrink-0">2h ago</span>
                                </div>

                                {/* Item 4 */}
                                <div className="flex items-start gap-3.5 py-3.5 first:pt-1 last:pb-1">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] text-purple-700">
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-[#0f172a]">Staff completed qualification: Michael B.</p>
                                            <span className="rounded-[9999px] border border-[#8b5cf6]/[0.20] bg-[#8b5cf6]/[0.10] px-1.5 py-0.2 text-[9px] font-bold text-purple-700 uppercase">
                                                Certified
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#64748b]">Hydrogen Therapy Safety · Level 2</p>
                                    </div>
                                    <span className="font-mono text-[11px] font-medium text-[#94a3b8] shrink-0">4h ago</span>
                                </div>

                                {/* Item 5 */}
                                <div className="flex items-start gap-3.5 py-3.5 first:pt-1 last:pb-1">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700">
                                        <ShoppingBag className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-[#0f172a]">Consumable reorder requested: Oxygen masks & filters</p>
                                            <span className="rounded-[9999px] border border-[#10b981]/[0.20] bg-[#10b981]/[0.10] px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 uppercase">
                                                Approved
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#64748b]">Auto-approved · ETA 2 days</p>
                                    </div>
                                    <span className="font-mono text-[11px] font-medium text-[#94a3b8] shrink-0">1d ago</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions 2x2 Grid */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <h2 className="text-base font-bold text-[#0f172a]">Quick Actions</h2>
                            <p className="text-xs text-[#64748b] mt-0.5">Common operational workflows and shortcuts</p>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                    onClick={() => handleQuickAction(NEXUS_MODULE_NAV_ITEM_BY_KEY.clients.href, 'clients', 'Clients')}
                                    className="flex items-start gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-3.5 text-left transition-all hover:border-cyan-400 hover:bg-[#f8fafc] hover:shadow-xs"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#06b6d4]/[0.10] text-cyan-700">
                                        <UserPlus className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#0f172a]">Add client</p>
                                        <p className="text-[11px] text-[#64748b]">New intake & protocol setup</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                    onClick={() => handleQuickAction(NEXUS_MODULE_NAV_ITEM_BY_KEY.service.href, 'service', 'Service')}
                                    className="flex items-start gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-3.5 text-left transition-all hover:border-amber-400 hover:bg-[#f8fafc] hover:shadow-xs"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f59e0b]/[0.10] text-amber-700">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#0f172a]">Schedule service</p>
                                        <p className="text-[11px] text-[#64748b]">Book maintenance or check</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                    onClick={() => handleQuickAction(NEXUS_MODULE_NAV_ITEM_BY_KEY.supplies.href, 'supplies', 'Supplies')}
                                    className="flex items-start gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-3.5 text-left transition-all hover:border-emerald-400 hover:bg-[#f8fafc] hover:shadow-xs"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#10b981]/[0.10] text-emerald-700">
                                        <ShoppingCart className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#0f172a]">Order supplies</p>
                                        <p className="text-[11px] text-[#64748b]">Restock clinical consumables</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                    onClick={() => handleQuickAction(NEXUS_MODULE_NAV_ITEM_BY_KEY.docs.href, 'docs', 'Docs')}
                                    className="flex items-start gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] p-3.5 text-left transition-all hover:border-purple-400 hover:bg-[#f8fafc] hover:shadow-xs"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#8b5cf6]/[0.10] text-purple-700">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#0f172a]">View documents</p>
                                        <p className="text-[11px] text-[#64748b]">Protocols, manuals, SOPs</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: System Status + Upcoming Schedule (5 Cols) */}
                    <div className="space-y-6 lg:col-span-5">
                        {/* System Status Card */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-[#0f172a]">System Status</h2>
                                    <p className="text-xs text-[#64748b]">4 devices connected</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-[9999px] border border-[#10b981]/[0.25] bg-[#10b981]/[0.10] px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-[9999px] bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-[9999px] bg-emerald-600" />
                                    </span>
                                    All nominal
                                </span>
                            </div>

                            <div className="mt-4 space-y-3">
                                {/* Device 1: OxyLife I / 90 */}
                                <div className="flex items-center gap-3 rounded-[14px] border border-[#f1f5f9] bg-[#ffffff] p-3 transition-all hover:border-[#cbd5e1] hover:bg-[#f8fafc]">
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-1">
                                        <Image
                                            src="/images/nexus/devices/oxylife-90.png"
                                            alt="OxyLife I / 90 HBOT chamber"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-[#0f172a]">OxyLife I / 90</p>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-[#10b981]/[0.10] border border-[#10b981]/[0.20] px-2 py-0.5 rounded-[9999px]">
                                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-600 animate-pulse" />
                                                1.82 ATA
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-cyan-700 font-semibold">Hyperbaric Oxygen (HBOT)</p>
                                        <p className="text-[10px] text-[#64748b]">1.5 – 2.0 ATA · Pressure nominal · 99.5% O2</p>
                                    </div>
                                </div>

                                {/* Device 2: OxyHydrogen 280 */}
                                <div className="flex items-center gap-3 rounded-[14px] border border-[#f1f5f9] bg-[#ffffff] p-3 transition-all hover:border-[#cbd5e1] hover:bg-[#f8fafc]">
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-1">
                                        <Image
                                            src="/images/nexus/devices/oxyhydrogen-280.png"
                                            alt="OxyHydrogen 280 generator"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-[#0f172a]">OxyHydrogen 280</p>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-[#10b981]/[0.10] border border-[#10b981]/[0.20] px-2 py-0.5 rounded-[9999px]">
                                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-600 animate-pulse" />
                                                1,800 ml/min
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-teal-700 font-semibold">Molecular Hydrogen Inhalation</p>
                                        <p className="text-[10px] text-[#64748b]">Purity 99.99% · Gas delivery nominal</p>
                                    </div>
                                </div>

                                {/* Device 3: PEMF Pro */}
                                <div className="flex items-center gap-3 rounded-[14px] border border-[#f1f5f9] bg-[#ffffff] p-3 transition-all hover:border-[#cbd5e1] hover:bg-[#f8fafc]">
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc]">
                                        <Image
                                            src="/images/landing/card-pemf-v2.jpg"
                                            alt="PEMF Pro therapy lounger"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-[#0f172a]">PEMF Pro</p>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-[#10b981]/[0.10] border border-[#10b981]/[0.20] px-2 py-0.5 rounded-[9999px]">
                                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-600 animate-pulse" />
                                                Online
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-purple-700 font-semibold">Pulsed Electromagnetic Field</p>
                                        <p className="text-[10px] text-[#64748b]">10 – 50 Hz · Coils calibrated</p>
                                    </div>
                                </div>

                                {/* Device 4: Red Light Pro */}
                                <div className="flex items-center gap-3 rounded-[14px] border border-[#f1f5f9] bg-[#ffffff] p-3 transition-all hover:border-[#cbd5e1] hover:bg-[#f8fafc]">
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc]">
                                        <Image
                                            src="/images/landing/card-redlight-v2.jpg"
                                            alt="Red Light Pro photobiomodulation canopy"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-[#0f172a]">Red Light Pro</p>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-800 bg-[#06b6d4]/[0.10] border border-[#06b6d4]/[0.20] px-2 py-0.5 rounded-[9999px]">
                                                Standby
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-rose-700 font-semibold">Full Body Photobiomodulation</p>
                                        <p className="text-[10px] text-[#64748b]">660 / 850 nm · Ready for session</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Today's Schedule Card */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-[#0f172a]">Today's Schedule</h2>
                                    <p className="text-xs text-[#64748b]">4 clinical sessions booked</p>
                                </div>
                                <span className="text-xs font-bold text-cyan-700">Oct 14</span>
                            </div>

                            <div className="mt-4 space-y-3">
                                {/* Session 1 */}
                                <div className="flex items-center justify-between rounded-[14px] border border-[#10b981]/[0.25] bg-[#10b981]/[0.04] p-3 transition-colors hover:bg-[#10b981]/[0.08]">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#0f172a]">Sarah Jenkins</span>
                                            <span className="rounded-[9999px] bg-[#06b6d4]/[0.12] border border-[#06b6d4]/[0.20] px-2 py-0.5 text-[9px] font-bold uppercase text-cyan-800">HBOT</span>
                                            <span className="inline-flex items-center gap-1 rounded-[9999px] bg-[#10b981]/[0.12] border border-[#10b981]/[0.20] px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-600 animate-pulse" />
                                                In Progress
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#64748b] mt-0.5">Suite 1 · 1.5 ATA Session</p>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-[#0f172a]">09:30 – 10:30</span>
                                </div>

                                {/* Session 2 */}
                                <div className="flex items-center justify-between rounded-[14px] border border-[#f1f5f9] bg-[#ffffff] p-3 transition-colors hover:bg-[#f8fafc]">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#0f172a]">David Miller</span>
                                            <span className="rounded-[9999px] bg-[#14b8a6]/[0.10] border border-[#14b8a6]/[0.20] px-2 py-0.5 text-[9px] font-bold uppercase text-teal-800">Hydrogen</span>
                                            <span className="text-[9px] font-bold text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.2 rounded-[9999px]">Confirmed</span>
                                        </div>
                                        <p className="text-[11px] text-[#64748b] mt-0.5">Suite 3 · 60m Inhalation</p>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-[#0f172a]">11:00 – 12:00</span>
                                </div>

                                {/* Session 3 */}
                                <div className="flex items-center justify-between rounded-[14px] border border-[#f1f5f9] bg-[#ffffff] p-3 transition-colors hover:bg-[#f8fafc]">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#0f172a]">Elena Rostova</span>
                                            <span className="rounded-[9999px] bg-[#8b5cf6]/[0.10] border border-[#8b5cf6]/[0.20] px-2 py-0.5 text-[9px] font-bold uppercase text-purple-800">PEMF</span>
                                            <span className="text-[9px] font-bold text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.2 rounded-[9999px]">Confirmed</span>
                                        </div>
                                        <p className="text-[11px] text-[#64748b] mt-0.5">Suite 2 · Deep Recovery</p>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-[#0f172a]">14:00 – 15:00</span>
                                </div>

                                {/* Session 4 */}
                                <div className="flex items-center justify-between rounded-[14px] border border-[#f1f5f9] bg-[#ffffff] p-3 transition-colors hover:bg-[#f8fafc]">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#0f172a]">Marcus Vance</span>
                                            <span className="rounded-[9999px] bg-[#f43f5e]/[0.10] border border-[#f43f5e]/[0.20] px-2 py-0.5 text-[9px] font-bold uppercase text-rose-800">Red Light</span>
                                            <span className="text-[9px] font-bold text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.2 rounded-[9999px]">Confirmed</span>
                                        </div>
                                        <p className="text-[11px] text-[#64748b] mt-0.5">Suite 4 · Full Spectrum</p>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-[#0f172a]">16:30 – 17:30</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 04. 8 CORE MODULES GRID MATCHING REFERENCE */}
                <section
                    id="nexus-modules"
                    aria-label="Nexus module route map: 8 public sample modules, no live clinic records shown"
                    className="space-y-6 pt-4"
                >
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-[#e2e8f0] pb-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                OPERATOR WORKSPACE
                            </p>
                            <h2 className="mt-1 text-2xl font-extrabold text-[#0f172a] sm:text-3xl">
                                Explore the route network module by module.
                            </h2>
                        </div>
                        <p className="max-w-xl text-xs leading-relaxed text-[#64748b] sm:text-sm">
                            Each module route stays available for walkthrough and can be upgraded into full partner access without changing the core route structure.
                        </p>
                    </div>

                    <div
                        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                        role="list"
                        aria-label="Nexus module route map: 8 public sample modules, no live clinic records shown"
                    >
                        {MODULES.map((module) => (
                            <div key={module.href} role="listitem">
                                <ModulePreviewCard
                                    {...module}
                                    onRouteStatusChange={setRouteStatus}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 05. RESOURCES & SUPPORT SECTION MATCHING REFERENCE */}
                <section aria-label="Support and Rollout Enablement" className="space-y-6 pt-4">
                    <div className="border-b border-[#e2e8f0] pb-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                            SUPPORT & ENABLEMENT
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold text-[#0f172a]">
                            Resources & Assistance
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {/* Resource 1 */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#06b6d4]/[0.10] text-cyan-700">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#0f172a]">Knowledge base</h3>
                            <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                Browse clinical protocols, device operating manuals, and standard operating procedures.
                            </p>
                            <button
                                type="button"
                                aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                onClick={() => handleQuickAction(NEXUS_MODULE_NAV_ITEM_BY_KEY.docs.href, 'docs', 'Documents')}
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                            >
                                Browse guides →
                            </button>
                        </div>

                        {/* Resource 2 */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-purple-50 text-purple-700">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#0f172a]">Help center</h3>
                            <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                Frequently asked questions, troubleshooting steps, and video walkthroughs for staff.
                            </p>
                            <button
                                type="button"
                                aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                onClick={() => handleQuickAction(NEXUS_MODULE_NAV_ITEM_BY_KEY.academy.href, 'academy', 'Academy')}
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                            >
                                Visit help center →
                            </button>
                        </div>

                        {/* Resource 3 */}
                        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#10b981]/[0.10] text-emerald-700">
                                <PhoneCall className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#0f172a]">Contact support</h3>
                            <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                Direct line to Hylono clinical support and biomedical engineering team.
                            </p>
                            <button
                                type="button"
                                aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                onClick={handleContactClick}
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                            >
                                Get in touch →
                            </button>
                        </div>
                    </div>

                    {/* Coastal Mountain Grand CTA Banner */}
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-[#e2e8f0] bg-slate-950 p-8 text-[#ffffff] shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-10">
                        <div className="absolute inset-0 pointer-events-none">
                            <Image
                                src="/images/nexus/nexus-support-banner.jpg"
                                alt="Scenic coastal mountain fjord landscape"
                                fill
                                sizes="100vw"
                                className="object-cover opacity-35 mix-blend-screen"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-[#020617]/[0.80] to-transparent" />
                        </div>

                        <div className="relative z-10 max-w-xl">
                            <h3 className="text-xl font-extrabold tracking-tight text-[#ffffff] sm:text-2xl">
                                Need help with setup or rollout?
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                                Our clinical operations team is available to assist with onboarding, device commissioning, and protocol integration.
                            </p>
                            <div className="mt-5">
                                <button
                                    type="button"
                                    aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                    onClick={handleContactClick}
                                    className="inline-flex items-center gap-2 rounded-[14px] bg-[#ffffff] px-5 py-2.5 text-xs font-bold text-[#0f172a] shadow-xs hover:bg-[#f8fafc] transition-colors"
                                >
                                    Contact Hylono →
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 06. SEMANTIC WORKSPACE FOOTER MATCHING REFERENCE */}
                <footer className="border-t border-[#e2e8f0] pt-6 text-xs text-[#64748b]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-bold uppercase tracking-wider text-[#0f172a]">
                                HYLONO NEXUS · Operator workspace · v2.0.1
                            </p>
                            <p className="text-[11px] text-[#94a3b8] mt-0.5">
                                Autonomous clinical operations platform. All systems nominal.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#64748b]">
                            <button
                                type="button"
                                aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                onClick={() => { if (typeof window !== 'undefined') window.location.href = '/legal/privacy'; }}
                                className="hover:text-[#0f172a] transition-colors"
                            >
                                Privacy Policy
                            </button>
                            <span>·</span>
                            <button
                                type="button"
                                aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                onClick={() => { if (typeof window !== 'undefined') window.location.href = '/legal/terms'; }}
                                className="hover:text-[#0f172a] transition-colors"
                            >
                                Terms of Service
                            </button>
                            <span>·</span>
                            <button
                                type="button"
                                aria-describedby={NEXUS_OVERVIEW_ROUTE_STATUS_ID}
                                onClick={() => { if (typeof window !== 'undefined') window.location.href = '/contact'; }}
                                className="hover:text-[#0f172a] transition-colors"
                            >
                                Support
                            </button>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-500" />
                                Operational
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </PartnerLayout>
    );
};
