import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, ArrowUp, Shield, Building2, Headphones, Mail } from 'lucide-react';
import { MenuContext, TECH_COLOR_MAP } from './MegaMenuData';
import { NAV_GROUPS } from './MegaMenuNavGroups';

const isInternalHref = (href: string): boolean => href.startsWith('/') && !href.startsWith('//');

interface MenuActionStatusProps {
    actionStatusId?: string;
    onActionFocus?: () => void;
}

export const SectionHeader = React.memo(({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
    <div className="flex items-center gap-2 select-none opacity-80 min-w-0">
        <span className={`${color} shrink-0`}>{icon}</span>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 futuristic-font">
            {title}
        </h3>
    </div>
));
SectionHeader.displayName = 'SectionHeader';

export const SimpleLink = React.memo(({ label, onClick, onHover, href, actionStatusId, onActionFocus }: {
    label: string;
    onClick: () => void;
    onHover: () => void;
    href?: string;
} & MenuActionStatusProps) => {
    const commonProps = {
        onMouseEnter: onHover,
        onFocus: onActionFocus,
        'aria-describedby': actionStatusId,
        className: "group flex min-h-[26px] w-full items-center justify-between gap-1.5 rounded px-1.5 py-0.5 text-left transition-colors duration-150 hover:bg-cyan-50/90 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 text-slate-950 motion-reduce:transition-none"
    };

    const content = (
        <>
            <span className="min-w-0 flex-1 text-[13.5px] sm:text-[14px] font-semibold leading-snug transition-colors group-hover:text-cyan-700 break-words">{label}</span>
            <ArrowRight size={12} className="shrink-0 ml-1 text-slate-600 opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-cyan-700" aria-hidden="true" />
        </>
    );

    if (href) {
        if (isInternalHref(href)) {
            return (
                <Link href={href} onClick={onClick} {...commonProps}>
                    {content}
                </Link>
            );
        }

        return (
            <a href={href} onClick={onClick} {...commonProps}>
                {content}
            </a>
        );
    }

    return (
        <button type="button" onClick={onClick} {...commonProps}>
            {content}
        </button>
    );
});
SimpleLink.displayName = 'SimpleLink';

export const PresentationSubLink = React.memo(({
    label,
    onClick,
}: {
    label: string;
    onClick?: () => void;
}) => {
    return (
        <div
            role="presentation"
            onClick={onClick}
            className="group flex min-h-[22px] w-full items-center justify-between gap-1 rounded px-1 py-0.5 text-left transition-colors duration-150 hover:bg-slate-100/90 cursor-pointer select-none"
        >
            <span className="text-[13px] sm:text-[13.5px] font-semibold text-slate-950 transition-colors group-hover:text-cyan-700 break-words leading-tight">
                {label}
            </span>
            <ArrowRight size={11} className="shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-700" />
        </div>
    );
});
PresentationSubLink.displayName = 'PresentationSubLink';

export const GlassLink = React.memo(({ icon, title, sub, onClick, onHover, dimmed, color = "text-indigo-400", bg = "bg-indigo-400/10", href, actionStatusId, onActionFocus }: {
    icon: React.ReactNode;
    title: string;
    sub: string;
    onClick: () => void;
    onHover: () => void;
    dimmed: boolean;
    color?: string;
    bg?: string;
    href?: string;
} & MenuActionStatusProps) => {
    const commonProps = {
        onMouseEnter: onHover,
        onFocus: onActionFocus,
        'aria-describedby': actionStatusId,
        className: `relative w-full min-h-[52px] flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all duration-300 group outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none motion-reduce:hover:translate-y-0
            ${dimmed
                ? 'opacity-40 grayscale border-transparent bg-transparent'
                : 'bg-white/80 border-slate-200 hover:border-cyan-400/50 hover:bg-white hover:shadow-[0_8px_20px_rgba(6,182,212,0.08)] opacity-100'
            }
        `
    };

    const content = (
        <>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] duration-200 ${
                dimmed ? 'bg-white/5 text-slate-400' : `${color} ${bg}`
            }`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1 pr-1">
                <div className="text-xs sm:text-[13px] font-semibold leading-snug text-slate-800 transition-colors group-hover:text-slate-950 futuristic-font break-words">{title}</div>
                <div className="mt-0.5 text-[9px] uppercase leading-tight tracking-wider text-slate-500 transition-colors group-hover:text-slate-600 break-words">{sub}</div>
            </div>
            <ArrowRight size={14} className="shrink-0 text-slate-400 opacity-0 transition-[opacity,transform,color] group-hover:translate-x-0.5 group-hover:text-slate-700 group-hover:opacity-100 ml-auto" aria-hidden="true" />
        </>
    );

    if (href) {
        if (isInternalHref(href)) {
            return (
                <Link href={href} onClick={onClick} {...commonProps}>
                    {content}
                </Link>
            );
        }

        return (
            <a href={href} onClick={onClick} {...commonProps}>
                {content}
            </a>
        );
    }

    return (
        <button type="button" onClick={onClick} {...commonProps}>
            {content}
        </button>
    );
});
GlassLink.displayName = 'GlassLink';

export const TechHoloCard = React.memo(({ context, title, subtitle, icon, activeContext, onHover, onClick, color, href, actionStatusId, onActionFocus }: {
    context: MenuContext;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    activeContext: MenuContext;
    onHover: (ctx: MenuContext) => void;
    onClick: () => void;
    color: string;
    href?: string;
} & MenuActionStatusProps) => {
    const isActive = activeContext === context;
    const colors = TECH_COLOR_MAP[color] || TECH_COLOR_MAP['text-cyan-400'];

    const commonProps = {
        onMouseEnter: () => onHover(context),
        onFocus: onActionFocus,
        'aria-describedby': actionStatusId,
        className: "group relative min-h-[80px] w-full overflow-hidden rounded-xl border p-3 outline-none transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        style: {
            transition: 'border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 200ms cubic-bezier(0.25, 0.1, 0.25, 1), background-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
            borderColor: isActive ? colors.activeBorder : 'rgba(232,223,210,0.9)',
            backgroundColor: isActive ? colors.activeBg : 'rgba(255,253,248,0.84)',
            boxShadow: isActive ? colors.activeShadow : 'none',
        } as React.CSSProperties
    };

    const content = (
        <>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ backgroundColor: colors.barActive }}
            />
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl group-hover:scale-105"
                    style={{
                        transition: 'transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1), background-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1), color 200ms cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                        backgroundColor: colors.iconDefaultBg,
                        color: colors.iconDefaultText,
                        boxShadow: isActive ? `inset 0 0 20px ${colors.iconDefaultText}40` : 'none',
                    }}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div
                        className="text-[9.5px] font-bold uppercase tracking-widest mb-0.5 break-words"
                        style={{
                            transition: 'color 200ms',
                            color: isActive ? colors.subtitleActive : colors.subtitleDefault,
                        }}
                    >
                        {subtitle}
                    </div>
                    <div
                        className="break-words text-sm sm:text-[15px] font-bold leading-tight futuristic-font"
                        style={{
                            transition: 'color 200ms',
                            color: isActive ? '#101820' : '#334155',
                        }}
                    >
                        {title}
                    </div>
                </div>
                <ArrowRight
                    size={16}
                    className="shrink-0 text-slate-400 opacity-0 transition-[opacity,transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700 group-hover:opacity-100 ml-auto"
                    aria-hidden="true"
                />
            </div>
        </>
    );

    if (href) {
        if (isInternalHref(href)) {
            return (
                <Link href={href} onClick={onClick} {...commonProps}>
                    {content}
                </Link>
            );
        }

        return (
            <a href={href} onClick={onClick} {...commonProps}>
                {content}
            </a>
        );
    }

    return (
        <button type="button" onClick={onClick} {...commonProps}>
            {content}
        </button>
    );
});
TechHoloCard.displayName = 'TechHoloCard';

/* =========================================================================
   NEW HIGH-FIDELITY REFERENCE COMPONENTS
   Matching media_1789415241958.jpg with uncropped authentic 4K imagery
   ========================================================================= */

/**
 * Left Hero Column: Systems
 * Atmospheric alpine mountain mist background with editorial typography and luxury CTA
 */
export const SystemsHeroCard = React.memo(({
    onNavigate,
    onActionFocus,
    actionStatusId,
}: {
    onNavigate: () => void;
    onActionFocus?: () => void;
    actionStatusId?: string;
}) => {
    return (
        <div
            onClick={onNavigate}
            onMouseEnter={onActionFocus}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.2rem] border border-slate-200/90 shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-cyan-400/80 hover:shadow-[0_12px_28px_-6px_rgba(6,182,212,0.16)] cursor-pointer select-none"
        >
            {/* Full-bleed background image filling entire card */}
            <Image
                src="/images/megamenu/hero-systems-bg.jpg"
                alt="Hylono Advanced Systems alpine landscape"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 240px"
                className="object-cover object-bottom transition-transform duration-300 ease-out transform-gpu will-change-transform group-hover:scale-105"
            />
            {/* Cream gradient overlay — solid at top, fading to transparent at bottom */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FAF9F6] from-[20%] via-[#FAF9F6]/85 via-[45%] to-transparent" />

            {/* Top Tag */}
            <div className="relative z-10 p-3 sm:p-3.5 pb-0">
                <span className="text-[11px] sm:text-[11.5px] font-extrabold uppercase tracking-[0.22em] text-slate-950 font-mono block">
                    SYSTEMS
                </span>
            </div>

            {/* Middle Editorial Title & Description */}
            <div className="relative z-10 px-3 sm:px-3.5 my-2">
                <div
                    role="heading"
                    aria-level={3}
                    className="text-[26px] sm:text-[28px] lg:text-[30px] font-medium tracking-tight text-slate-950 leading-[1.1] !font-serif"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif", textTransform: 'none', letterSpacing: 'normal' }}
                >
                    Advanced<br />
                    technologies<br />
                    <span className="italic font-normal whitespace-nowrap">for real results.</span>
                </div>
                <p className="mt-2 text-[12.5px] sm:text-[13px] leading-relaxed text-slate-700 break-words font-sans font-medium">
                    Explore our systems and discover how each technology works — and how it fits into your wellness plan.
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/90 px-3.5 py-1.5 text-[12px] sm:text-[12.5px] font-bold text-slate-950 shadow-xs transition-colors duration-150 group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:text-white">
                    <span>Explore all systems</span>
                    <ArrowRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
            </div>

            {/* Spacer to push content up and let bottom photo area breathe */}
            <div className="relative z-0 h-[90px] sm:h-[100px] lg:h-[110px]" />
        </div>
    );
});
SystemsHeroCard.displayName = 'SystemsHeroCard';

/**
 * Hardware Card (Cards 01 to 05):
 * Full-bleed background image with cream gradient at top for legible text,
 * photo visible in the lower ~55% of the card, frosted circle arrow at bottom
 */
export const HardwareCard = React.memo(({
    numberTag,
    title,
    desc,
    image,
    href,
    onClick,
    onFocus,
    onHover,
    actionStatusId,
}: {
    numberTag: string;
    tagColor?: string;
    title: string;
    desc: string;
    image: string;
    href: string;
    onClick: () => void;
    onFocus: () => void;
    onHover?: () => void;
    actionStatusId?: string;
}) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            onFocus={onFocus}
            onMouseEnter={onHover}
            aria-describedby={actionStatusId}
            className="group relative flex h-full min-h-[265px] sm:min-h-[275px] lg:min-h-[285px] flex-col justify-between overflow-hidden rounded-[1.2rem] border border-slate-200/90 shadow-xs transition-[border-color,box-shadow] duration-200 ease-out hover:border-cyan-400/80 hover:shadow-[0_12px_28px_-6px_rgba(6,182,212,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 select-none"
        >
            {/* Full-bleed background image */}
            <Image
                src={image}
                alt={title}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 220px"
                className="object-cover object-center transition-transform duration-300 ease-out transform-gpu will-change-transform group-hover:scale-105"
            />
            {/* Cream gradient overlay — solid cream top fading to transparent */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FAF9F6] from-[15%] via-[#FAF9F6]/90 via-[40%] to-transparent" />

            {/* Top Text Content on gradient overlay (readable) */}
            <div className="relative z-10 p-3 sm:p-3.5 pb-0">
                <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-slate-800 block mb-0.5 font-mono">
                    {numberTag}
                </span>
                <div
                    role="heading"
                    aria-level={4}
                    className="text-[16.5px] sm:text-[17.5px] font-bold text-slate-950 leading-snug tracking-tight !font-serif break-words"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif", textTransform: 'none', letterSpacing: 'normal' }}
                >
                    {title.includes(' (HBOT)') ? (
                        <>
                            <span>Hyperbaric</span>
                            <br />
                            <span className="text-[13.5px] text-slate-950 font-medium">(HBOT)</span>
                        </>
                    ) : (
                        title
                    )}
                </div>
                <p className="mt-1 text-[12px] sm:text-[12.5px] leading-snug text-slate-700 break-words font-sans font-medium">
                    {desc}
                </p>
            </div>

            {/* Frosted Circular Arrow Button floating at bottom-left over exposed photo */}
            <div className="relative z-10 p-3 sm:p-3.5 pt-0 mt-auto">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-white/90 text-slate-900 shadow-xs transition-all duration-150 group-hover:bg-slate-950 group-hover:text-white group-hover:scale-105">
                    <ArrowRight size={13} strokeWidth={2.2} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
});
HardwareCard.displayName = 'HardwareCard';

/**
 * Solution & Guides Card (Cards 06 to 10):
 * Full-bleed background image with cream gradient at top for text,
 * white gradient from bottom for sub-navigation link readability
 */
export const SolutionCard = React.memo(({
    numberTag,
    title,
    desc,
    image,
    imagePosition = 'object-center',
    children,
}: {
    numberTag: string;
    tagColor?: string;
    title: string;
    subtitle?: string;
    desc: string;
    image: string;
    imagePosition?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div className="group relative flex h-full min-h-[265px] sm:min-h-[275px] lg:min-h-[285px] flex-col justify-between overflow-hidden rounded-[1.2rem] border border-slate-200/90 shadow-xs transition-[border-color,box-shadow] duration-200 ease-out hover:border-cyan-400/80 hover:shadow-[0_12px_28px_-6px_rgba(6,182,212,0.16)] select-none">
            {/* Full-bleed background image */}
            <Image
                src={image}
                alt={title}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 220px"
                className={`object-cover ${imagePosition} transition-transform duration-300 ease-out transform-gpu will-change-transform group-hover:scale-105`}
            />
            {/* Top cream gradient overlay for text readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FAF9F6] from-[10%] via-[#FAF9F6]/80 via-[28%] to-transparent to-[50%]" />
            {/* Bottom white gradient overlay for link readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FAF9F6] from-[22%] via-[#FAF9F6]/85 via-[42%] to-transparent to-[55%]" />

            {/* Top Text Content */}
            <div className="relative z-10 p-3 sm:p-3.5 pb-0">
                <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-slate-800 block mb-0.5 font-mono">
                    {numberTag}
                </span>
                <div
                    role="heading"
                    aria-level={4}
                    className="text-[16.5px] sm:text-[17.5px] font-bold text-slate-950 leading-snug tracking-tight !font-serif break-words"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif", textTransform: 'none', letterSpacing: 'normal' }}
                >
                    {title}
                </div>
                <p className="mt-0.5 text-[12px] sm:text-[12.5px] leading-snug text-slate-700 break-words font-sans font-medium">
                    {desc}
                </p>
            </div>

            {/* Bottom: Sub-navigation Links */}
            <div className="relative z-10 mt-auto space-y-0.5 px-3 sm:px-3.5 pb-3 sm:pb-3.5 pt-0.5">
                {children}
            </div>
        </div>
    );
});
SolutionCard.displayName = 'SolutionCard';

/**
 * Card Action Link for SolutionCard
 * Accessible Next.js Link with aria-describedby and focus handling
 */
export const CardActionLink = React.memo(({
    label,
    href,
    onClick,
    onFocus,
    onHover,
    actionStatusId,
}: {
    label: string;
    href: string;
    onClick: () => void;
    onFocus: () => void;
    onHover?: () => void;
    actionStatusId: string;
}) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            onFocus={onFocus}
            onMouseEnter={onHover}
            aria-describedby={actionStatusId}
            className="group/link flex min-h-[22px] w-full items-center justify-between text-left text-[13px] sm:text-[13.5px] font-bold text-slate-950 transition-colors hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded px-1 py-0.5"
        >
            <span className="break-words">{label}</span>
            <ArrowRight size={12} className="shrink-0 text-slate-600 transition-transform duration-150 group-hover/link:translate-x-0.5 group-hover/link:text-cyan-700" />
        </Link>
    );
});
CardActionLink.displayName = 'CardActionLink';

/**
 * Utility Footer Strip matching media_1789415241958.jpg
 * 5 columns: Policies (split into 2 sub-cols), Company, Support, Stay Informed, and HYLONO Guided Wellness
 */
export const MegaMenuFooterStrip = React.memo(({
    onNavigate,
    onActionFocus,
    actionStatusId,
    onHoverReset,
    onHoverContext,
}: {
    onNavigate: (page: string, label: string) => () => void;
    onActionFocus: (label: string) => () => void;
    actionStatusId: string;
    onHoverReset: () => void;
    onHoverContext: (ctx: MenuContext) => void;
}) => {
    return (
        <div className="border-t border-slate-200/80 bg-white px-4 py-2 lg:px-6 lg:py-2">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5 items-start">
                {/* Column 1: Policies (Shield icon, 2 sub-columns) */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Shield size={15} className="text-slate-950" />
                        <h4 className="text-[13px] sm:text-[13.5px] font-black uppercase tracking-[0.16em] text-slate-950 futuristic-font">
                            POLICIES
                        </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5">
                        <div className="flex flex-col space-y-0.5">
                            {NAV_GROUPS.policies.slice(0, 4).map((link) => (
                                <SimpleLink
                                    key={link.href}
                                    label={link.label}
                                    onHover={onHoverReset}
                                    onClick={onNavigate(link.page, link.label)}
                                    onActionFocus={onActionFocus(link.label)}
                                    actionStatusId={actionStatusId}
                                    href={link.href}
                                />
                            ))}
                        </div>
                        <div className="flex flex-col space-y-0.5">
                            {NAV_GROUPS.policies.slice(4).map((link) => (
                                <SimpleLink
                                    key={link.href}
                                    label={link.label}
                                    onHover={onHoverReset}
                                    onClick={onNavigate(link.page, link.label)}
                                    onActionFocus={onActionFocus(link.label)}
                                    actionStatusId={actionStatusId}
                                    href={link.href}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: Company (Building icon, 2 sub-columns) */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Building2 size={15} className="text-slate-950" />
                        <h4 className="text-[13px] sm:text-[13.5px] font-black uppercase tracking-[0.16em] text-slate-950 futuristic-font">
                            COMPANY
                        </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5">
                        <div className="flex flex-col space-y-0.5">
                            {NAV_GROUPS.company.slice(0, 3).map((link) => (
                                <SimpleLink
                                    key={link.href}
                                    label={link.label}
                                    onHover={() => link.context ? onHoverContext(link.context) : onHoverReset()}
                                    onClick={onNavigate(link.page, link.label)}
                                    onActionFocus={onActionFocus(link.label)}
                                    actionStatusId={actionStatusId}
                                    href={link.href}
                                />
                            ))}
                        </div>
                        <div className="flex flex-col space-y-0.5">
                            {NAV_GROUPS.company.slice(3).map((link) => (
                                <SimpleLink
                                    key={link.href}
                                    label={link.label}
                                    onHover={() => link.context ? onHoverContext(link.context) : onHoverReset()}
                                    onClick={onNavigate(link.page, link.label)}
                                    onActionFocus={onActionFocus(link.label)}
                                    actionStatusId={actionStatusId}
                                    href={link.href}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Support (Headphones icon) */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Headphones size={15} className="text-slate-950" />
                        <h4 className="text-[13px] sm:text-[13.5px] font-black uppercase tracking-[0.16em] text-slate-950 futuristic-font">
                            SUPPORT
                        </h4>
                    </div>
                    <div className="flex flex-col space-y-0.5">
                        {NAV_GROUPS.support.map((link) => (
                            <SimpleLink
                                key={link.href}
                                label={link.label}
                                onHover={() => link.context ? onHoverContext(link.context) : onHoverReset()}
                                onClick={onNavigate(link.page, link.label)}
                                onActionFocus={onActionFocus(link.label)}
                                actionStatusId={actionStatusId}
                                href={link.href}
                            />
                        ))}
                    </div>
                </div>

                {/* Column 4: Stay Informed (Mail icon, input with circle arrow button) */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Mail size={15} className="text-slate-950" />
                        <h4 className="text-[13px] sm:text-[13.5px] font-black uppercase tracking-[0.16em] text-slate-950 futuristic-font">
                            STAY INFORMED
                        </h4>
                    </div>
                    <p className="text-[12.5px] sm:text-[13px] text-slate-950 font-medium leading-snug mb-1.5 break-words">
                        Get the latest research, protocol updates and product news.
                    </p>
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Your email address"
                            aria-label="Newsletter email address"
                            className="w-full min-h-[32px] rounded-full border border-slate-300 bg-white px-3.5 pr-8 text-[12.5px] sm:text-[13px] text-slate-950 placeholder:text-slate-500 shadow-xs transition-colors duration-150 focus:border-slate-950 focus:outline-none"
                        />
                        <div
                            role="presentation"
                            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <ArrowRight size={12} />
                        </div>
                    </div>
                </div>

                {/* Column 5: Brand & Guided Wellness Overview */}
                <div>
                    <div className="mb-0.5">
                        <span className="text-[15px] sm:text-[16px] font-black uppercase tracking-[0.26em] text-slate-950 futuristic-font">
                            H Y L O N O
                        </span>
                    </div>
                    <p className="text-[13px] sm:text-[13.5px] font-bold tracking-wide text-slate-900 mb-1.5">
                        Guided Wellness
                    </p>
                    <div className="flex items-center gap-3 text-slate-950 mb-1.5 text-[13px] sm:text-[13.5px]">
                        <span className="cursor-pointer hover:text-cyan-700 transition-colors font-bold">IG</span>
                        <span className="cursor-pointer hover:text-cyan-700 transition-colors font-bold">X</span>
                        <span className="cursor-pointer hover:text-cyan-700 transition-colors font-bold">IN</span>
                        <span className="cursor-pointer hover:text-cyan-700 transition-colors font-bold">YT</span>
                    </div>
                    <p className="text-[11.5px] sm:text-[12px] text-slate-700 font-medium">
                        &copy; 2026 HYLONO SYSTEMS. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
});
MegaMenuFooterStrip.displayName = 'MegaMenuFooterStrip';

/**
 * Operational Status Bar matching media_1789415241958.jpg
 * Sleek bottom strip with green operational indicator, motto, and circular back to top button
 */
export const MegaMenuStatusBar = React.memo(({ onBackToTop }: { onBackToTop: () => void }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 bg-white px-4 py-2 lg:px-6 lg:py-2 text-[12.5px] sm:text-[13px] text-slate-950">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-bold text-slate-950">All systems operational</span>
            </div>

            <span className="hidden md:inline-block text-slate-900 text-[12.5px] sm:text-[13px] tracking-wide font-medium">
                Engineered for long-term health and cellular vitality.
            </span>

            <div
                onClick={onBackToTop}
                role="presentation"
                className="flex items-center gap-1.5 font-bold text-slate-950 hover:text-cyan-700 transition-colors cursor-pointer select-none"
            >
                <span>Back to top</span>
                <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full border border-slate-400 text-slate-950 hover:border-slate-950 hover:text-slate-950">
                    <ArrowUp size={12} />
                </span>
            </div>
        </div>
    );
});
MegaMenuStatusBar.displayName = 'MegaMenuStatusBar';

