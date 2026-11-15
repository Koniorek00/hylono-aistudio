import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

interface SupportPackagesSectionProps {
    dataName: string;
    productContactHref: string;
    getDetailActionStatusProps: (message: string) => Record<string, unknown>;
    handleSupportExitClick: (href: string, channel: string, label: string) => void;
}

export function SupportPackagesSection({
    dataName,
    productContactHref,
    getDetailActionStatusProps,
    handleSupportExitClick,
}: SupportPackagesSectionProps) {
    return (
        <section
            id="bundles"
            data-testid="product-detail-support-packages-surface"
            className="border-y border-white/10 bg-slate-950 py-20 text-white"
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Planning packages</span>
                    <h2 className="text-3xl font-bold text-white">Support packages</h2>
                    <p className="text-slate-400 mt-3 max-w-lg mx-auto text-sm">
                        Core setup items for starting with {dataName}, with support and policy review before any commitment.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bundle 1: Essential Start */}
                    <div className="flex flex-col rounded-lg border border-white/10 bg-white/[0.045] p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">Core path</span>
                                <h3 className="text-xl font-black text-white">Essential Start</h3>
                            </div>
                            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-100">Manual quote</div>
                        </div>
                        <ul className="space-y-3 mb-6 flex-1">
                            {[`Full ${dataName} device`, '3-month protocol guide (digital)', '1-hour onboarding call with Hylono support', 'Quick-start digital library'].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                                    <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-white/10 pt-6">
                            <div className="mb-4 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
                                Quote, support scope, and policy details are reviewed before commitment.
                            </div>
                            <Link
                                href={productContactHref}
                                {...getDetailActionStatusProps(`Setup review link is ready for ${dataName}.`)}
                                onClick={() => handleSupportExitClick(productContactHref, 'support_package', 'setup review')}
                                className="block w-full rounded-lg bg-cyan-300 py-3 text-center text-sm font-bold text-slate-950 transition-all hover:bg-cyan-200"
                            >
                                Request setup review
                            </Link>
                        </div>
                    </div>

                    {/* Bundle 2: Pro Protocol */}
                    <div className="relative flex flex-col overflow-hidden rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-8">
                        <div className="absolute right-0 top-0 rounded-bl-lg border border-cyan-300/20 bg-cyan-300 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-950">Extended review</div>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Advanced</span>
                                <h3 className="text-xl font-black text-white">Pro Protocol</h3>
                            </div>
                            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-100">Support review</div>
                        </div>
                        <ul className="space-y-3 mb-6 flex-1">
                            {[`Full ${dataName} device and accessories`, '6-month setup support program', 'Priority support line (48h response)', 'Advanced protocol library (PDF + video)', 'Quarterly check-in calls with Hylono support'].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                                    <CheckCircle size={14} className="text-cyan-200 mt-0.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-white/10 pt-6">
                            <div className="mb-4 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
                                Hylono confirms package contents, support scope, and terms before checkout.
                            </div>
                            <Link
                                href={productContactHref}
                                {...getDetailActionStatusProps(`Package review link is ready for ${dataName}.`)}
                                onClick={() => handleSupportExitClick(productContactHref, 'support_package', 'package review')}
                                className="block w-full rounded-lg bg-cyan-300 py-3 text-center text-sm font-bold text-slate-950 transition-all hover:bg-cyan-200"
                            >
                                Request package review
                            </Link>
                        </div>
                    </div>

                    {/* Bundle 3: Clinic Edition */}
                    <div className="flex flex-col rounded-lg border border-white/10 bg-white/[0.045] p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider block mb-1">Professional</span>
                                <h3 className="text-xl font-black text-white">Clinic Edition</h3>
                            </div>
                            <div className="rounded-lg border border-purple-300/20 bg-purple-300/10 px-3 py-1.5 text-xs font-black text-purple-100">Manual terms</div>
                        </div>
                        <ul className="space-y-3 mb-6 flex-1">
                            {[`Full ${dataName} device for professional setup`, 'Staff setup training scope', 'Professional setup consultation', 'Support retainer scope review', 'Client education and protocol handoff templates', 'Technical support response path review'].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                                    <CheckCircle size={14} className="text-purple-200 mt-0.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-white/10 pt-6">
                            <div className="mb-4 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
                                Professional terms are confirmed through a manual Hylono review.
                            </div>
                            <Link
                                href={`${productContactHref}&intent=b2b`}
                                {...getDetailActionStatusProps(`Professional review link is ready for ${dataName}.`)}
                                onClick={() => handleSupportExitClick(`${productContactHref}&intent=b2b`, 'support_package', 'professional review')}
                                className="block w-full rounded-lg bg-purple-300 py-3 text-center text-sm font-bold text-slate-950 transition-all hover:bg-purple-200"
                            >
                                Request professional review
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
