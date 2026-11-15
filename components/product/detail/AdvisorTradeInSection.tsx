import React from 'react';
import Link from 'next/link';

interface AdvisorTradeInSectionProps {
    advisorCtaEnabled: boolean;
    tradeInEnabled: boolean;
    contentCommerceProductId?: string;
    techSlug: string;
    dataName: string;
    rentalCommitmentMonths: number;
    advisorCta: {
        title: string;
        path: string;
        linkLabel: string;
    };
    tradeInCta: {
        text: string;
        path: string;
        linkLabel: string;
    };
    getDetailActionStatusProps: (readyMessage: string) => Record<string, unknown>;
    onSupportExitClick: (destination: string, surface: string, label: string) => void;
}

export const AdvisorTradeInSection: React.FC<AdvisorTradeInSectionProps> = ({
    advisorCtaEnabled,
    tradeInEnabled,
    contentCommerceProductId,
    techSlug,
    dataName,
    rentalCommitmentMonths,
    advisorCta,
    tradeInCta,
    getDetailActionStatusProps,
    onSupportExitClick,
}) => {
    if (!advisorCtaEnabled && (!tradeInEnabled || !contentCommerceProductId)) {
        return null;
    }

    return (
        <section
            data-testid="product-detail-advisor-tradein-surface"
            className="border-y border-white/10 bg-slate-950 py-12 text-white"
        >
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {advisorCtaEnabled && (
                        <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-5">
                            <h3 className="text-lg font-bold text-white">{advisorCta.title}</h3>
                            <p className="mt-1 text-sm text-slate-300">
                                Get a modality recommendation based on your goals, timing, and space constraints.
                            </p>
                            <Link
                                href={`/${advisorCta.path}?tech=${techSlug}`}
                                {...getDetailActionStatusProps(`${advisorCta.linkLabel} link is ready for ${dataName}.`)}
                                onClick={() => onSupportExitClick(`/${advisorCta.path}?tech=${techSlug}`, 'advisor_cta', advisorCta.linkLabel)}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-100 hover:text-cyan-50"
                            >
                                {advisorCta.linkLabel}
                            </Link>
                        </div>
                    )}

                    {tradeInEnabled && contentCommerceProductId && (
                        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                            <h3 className="text-lg font-bold text-white">{tradeInCta.text}</h3>
                            <p className="mt-1 text-sm text-slate-300">
                                Typical rental commitment starts at {rentalCommitmentMonths} month{rentalCommitmentMonths > 1 ? 's' : ''}. Upgrade later and apply eligible value from your previous device.
                            </p>
                            <Link
                                href={`/${tradeInCta.path}?product=${contentCommerceProductId}`}
                                {...getDetailActionStatusProps(`${tradeInCta.linkLabel} link is ready for ${dataName}.`)}
                                onClick={() => onSupportExitClick(`/${tradeInCta.path}?product=${contentCommerceProductId}`, 'trade_in_cta', tradeInCta.linkLabel)}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-100 hover:text-cyan-50"
                            >
                                {tradeInCta.linkLabel}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
