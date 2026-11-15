import React from 'react';
import Link from 'next/link';
import { Video, CheckCircle } from 'lucide-react';

interface SetupReviewSectionProps {
    productName: string;
    productContactHref: string;
    accentColor: string;
    getDetailActionStatusProps: (readyMessage: string) => Record<string, unknown>;
    onSupportExitClick: (destination: string, surface: string, label: string) => void;
}

export const SetupReviewSection: React.FC<SetupReviewSectionProps> = ({
    productName,
    productContactHref,
    accentColor,
    getDetailActionStatusProps,
    onSupportExitClick,
}) => {
    return (
        <section
            data-testid="product-detail-setup-review-surface"
            className="border-y border-white/10 bg-slate-950 py-16 text-white"
        >
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-8">
                    <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Setup Review</span>
                    <h2 className="text-3xl font-bold text-white">Review the setup path before you choose</h2>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white shadow-none sm:p-8">
                    <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                        <div>
                            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg ${accentColor} shadow-lg`}>
                                <Video size={24} aria-hidden="true" />
                            </div>
                            <p className="text-xl font-bold">Demo materials are shared after fit review</p>
                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                Hylono confirms the chamber configuration, room constraints, supervision model, and support scope before sending setup media or proposal materials. That keeps the demo path tied to the option a buyer is actually reviewing.
                            </p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-950/45 p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                                What we review first
                            </p>
                            <ul className="mt-4 space-y-3 text-sm text-slate-200">
                                {[
                                    'Configuration and chamber access needs',
                                    'Room, delivery, and setup constraints',
                                    'Support handoff and policy boundaries',
                                ].map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-300" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <Link
                                    href={productContactHref}
                                    {...getDetailActionStatusProps(`Setup review link is ready for ${productName}.`)}
                                    onClick={() => onSupportExitClick(productContactHref, 'setup_review', 'setup review')}
                                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
                                >
                                    Request review
                                </Link>
                                <Link
                                    href="/help"
                                    {...getDetailActionStatusProps(`Support path link is ready for ${productName}.`)}
                                    onClick={() => onSupportExitClick('/help', 'setup_review', 'support path')}
                                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.045] px-4 text-sm font-bold text-slate-100 transition-colors hover:bg-white/[0.10]"
                                >
                                    Support path
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
