import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Sparkles, Zap, Truck, MessageCircle } from 'lucide-react';
import {
    STORE_DECISION_MATRIX,
    STORE_ROUTE_ACTION_STATUS_ID,
    type StoreRouteActionSource,
} from './StorePageData';

interface StoreHeroHeaderProps {
    plannerSummaryLines: string[];
    prefersReducedMotion: boolean | null;
    announceStoreRouteAction: (destination: string) => void;
    trackStoreRouteTransition: (
        destination: string,
        source: StoreRouteActionSource,
        ctaRole: 'primary' | 'supporting'
    ) => void;
}

export const StoreHeroHeader: React.FC<StoreHeroHeaderProps> = ({
    plannerSummaryLines,
    prefersReducedMotion,
    announceStoreRouteAction,
    trackStoreRouteTransition,
}) => {
    return (
        <>
            {/* Hero Header */}
            <div className="relative mb-6 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white/85 shadow-xl shadow-slate-200/60 backdrop-blur-xl md:mb-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(47,159,179,0.12),transparent_34%),linear-gradient(135deg,rgba(255,253,248,0.92),rgba(255,255,255,0.78))]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent" />
                <div className="relative z-10 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
                    <div className="flex min-h-[18rem] flex-col justify-center text-left lg:min-h-[20rem]">
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700"
                        >
                            <Sparkles size={12} /> Curated technology comparison
                        </motion.div>
                        <h1 id="store-hero-headline" className="mb-4 max-w-4xl text-2xl font-bold leading-tight text-slate-950 futuristic-font sm:text-3xl md:text-5xl lg:text-5xl">
                            Choose the right technology, then choose how to start
                        </h1>
                        <p id="store-hero-description" className="max-w-2xl text-base leading-8 text-slate-600">
                            Compare device categories, pricing, rental access, and protocol fit before you move into specifications, research, and delivery planning.
                        </p>
                        {plannerSummaryLines.length > 0 && (
                            <div className="mt-6 inline-flex max-w-3xl flex-wrap items-center gap-2 rounded-lg border border-cyan-500/20 bg-white px-4 py-3 text-sm text-slate-700">
                                <span className="font-semibold">Planner context:</span>
                                {plannerSummaryLines.map((line) => (
                                    <span key={line} className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-page)] px-3 py-1 text-xs font-medium text-slate-700">
                                        {line}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative hidden min-h-[20rem] lg:block">
                        <div className="absolute inset-0 rounded-lg border border-[var(--border-soft)] bg-white/70 shadow-inner shadow-slate-200/60" />
                        <div className="absolute left-8 right-8 top-8 rounded-lg border border-[var(--border-soft)] bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">Store path</span>
                                <span className="rounded-lg bg-cyan-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#020617]">Compare</span>
                            </div>
                            <div className="mt-5 grid gap-3">
                                {STORE_DECISION_MATRIX.map((row, index) => (
                                    <div key={row.path} className="flex items-start gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-page)] p-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-50 text-xs font-bold text-cyan-700">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-950">{row.path}</p>
                                            <p className="mt-1 text-xs leading-5 text-slate-600 break-words">
                                                Open the matching review path before product depth.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute bottom-6 left-16 right-4 rounded-lg border border-cyan-500/20 bg-cyan-50 p-5 text-slate-950 shadow-xl shadow-slate-200/60">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">Review before commitment</p>
                            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                                {['Policy', 'Fit', 'Support'].map((item) => (
                                    <div key={item} className="rounded-lg border border-cyan-500/20 bg-white px-3 py-4 text-xs font-semibold text-cyan-800">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
                className="mb-8"
            >
                <div className="mx-auto grid max-w-6xl gap-3 md:grid-cols-3">
                    <Link
                        href="/wellness-planner"
                        prefetch={false}
                        aria-describedby={STORE_ROUTE_ACTION_STATUS_ID}
                        onFocus={() => {
                            announceStoreRouteAction('/wellness-planner');
                        }}
                        onClick={() => {
                            trackStoreRouteTransition('/wellness-planner', 'hero', 'supporting');
                        }}
                        className="group relative overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white p-6 text-left shadow-sm shadow-slate-200/60 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none sm:p-7"
                    >
                        <span aria-hidden="true" className="absolute right-4 top-4 h-16 w-16 rounded-lg border border-cyan-500/15 bg-cyan-50 transition-transform group-hover:scale-110 motion-reduce:transition-none" />
                        <div className="flex items-center gap-3">
                            <div className="mb-0 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-50">
                                <Zap size={18} className="text-cyan-700" />
                            </div>
                            <span className="text-sm font-semibold text-slate-950">Get matched first</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            Use the planner if you want a first-pass shortlist before comparing specs.
                        </p>
                    </Link>
                    <Link
                        href="/rental"
                        prefetch={false}
                        aria-describedby={STORE_ROUTE_ACTION_STATUS_ID}
                        onFocus={() => {
                            announceStoreRouteAction('/rental');
                        }}
                        onClick={() => {
                            trackStoreRouteTransition('/rental', 'hero', 'primary');
                        }}
                        className="group relative overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white p-6 text-left shadow-sm shadow-slate-200/60 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none sm:p-7"
                    >
                        <span aria-hidden="true" className="absolute right-4 top-4 h-16 w-16 rounded-lg border border-cyan-500/15 bg-cyan-50 transition-transform group-hover:scale-110 motion-reduce:transition-none" />
                        <div className="flex items-center gap-3">
                            <div className="mb-0 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-50">
                                <Truck size={18} className="text-cyan-700" />
                            </div>
                            <span className="text-sm font-semibold text-slate-950">Start with rental</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            Compare rental access, onboarding, and fit before an ownership decision.
                        </p>
                    </Link>
                    <Link
                        href="/contact"
                        prefetch={false}
                        aria-describedby={STORE_ROUTE_ACTION_STATUS_ID}
                        onFocus={() => {
                            announceStoreRouteAction('/contact');
                        }}
                        onClick={() => {
                            trackStoreRouteTransition('/contact', 'hero', 'supporting');
                        }}
                        className="group relative overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white p-6 text-left shadow-sm shadow-slate-200/60 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transform-none motion-reduce:transition-none sm:p-7"
                    >
                        <span aria-hidden="true" className="absolute right-4 top-4 h-16 w-16 rounded-lg border border-cyan-500/15 bg-cyan-50 transition-transform group-hover:scale-110 motion-reduce:transition-none" />
                        <div className="flex items-center gap-3">
                            <div className="mb-0 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-50">
                                <MessageCircle size={18} className="text-cyan-700" />
                            </div>
                            <span className="text-sm font-semibold text-slate-950">Talk to Hylono</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            Ask about delivery, setup scope, clinic use, or which system fits your space.
                        </p>
                    </Link>
                </div>
            </motion.div>
        </>
    );
};
