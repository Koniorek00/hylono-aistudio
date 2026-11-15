import React from 'react';
import Link from 'next/link';
import { Star, User, ThumbsUp } from 'lucide-react';

const createReviewsSectionId = (productName: string): string => {
    const slug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return slug || 'product';
};

// Star Rating Component
export const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
    <div className="flex items-center gap-0.5 shrink-0" aria-label={`${rating} out of 5 stars`} role="img">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={size}
                aria-hidden="true"
                className={`shrink-0 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
            />
        ))}
    </div>
);

// Single Review Card
export const ReviewCard: React.FC<{
    name: string;
    rating: number;
    date: string;
    text: string;
    verified?: boolean;
    helpful?: number;
    variant?: 'light' | 'dark';
}> = ({ name, rating, date, text, verified, helpful, variant = 'light' }) => {
    const isDark = variant === 'dark';

    return (
    <div className={`rounded-lg border p-6 shadow-none min-w-0 ${
        isDark ? 'border-white/10 bg-white/[0.045] text-white' : 'border-slate-100 bg-white'
    }`}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0 max-w-full">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                    isDark ? 'border-cyan-300/20 bg-cyan-300/10' : 'border-transparent bg-slate-100'
                }`}>
                    <User size={20} className={isDark ? 'text-cyan-100' : 'text-slate-400'} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</span>
                        {verified && (
                            <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-medium shrink-0 whitespace-nowrap ${
                                isDark ? 'border border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                                Verified Purchase
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">{date}</span>
                </div>
            </div>
            <StarRating rating={rating} />
        </div>
        <p className={`mb-4 text-sm leading-relaxed break-words text-pretty ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
        {helpful !== undefined && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                <ThumbsUp size={14} className="shrink-0" aria-hidden="true" />
                <span>{helpful} found this helpful</span>
            </span>
        )}
    </div>
    );
};

// Reviews Section for Product Pages
export const ReviewsSection: React.FC<{
    productName?: string;
    minReviewCount?: number;
    belowThresholdMessage?: string;
    variant?: 'light' | 'dark';
}> = ({
    productName = 'Product',
    minReviewCount = 0,
    belowThresholdMessage,
    variant = 'light',
}) => {
    const isDark = variant === 'dark';
    const reviews: Array<{
        name: string;
        rating: number;
        date: string;
        text: string;
        verified?: boolean;
        helpful?: number;
    }> = [];

    const avgRating =
        reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const showAggregateRating = reviews.length > 0 && reviews.length >= minReviewCount;
    const reviewsSummaryId = `reviews-section-${createReviewsSectionId(productName)}-summary`;
    const guidanceCards = [
        {
            title: 'Planning guidance',
            text:
                belowThresholdMessage ??
                `${productName} pages prioritize setup clarity, support paths, and policy visibility over synthetic review widgets.`,
        },
        {
            title: 'Policy access',
            text: 'Shipping, returns, warranty, and contact pages stay directly linked so commercial details remain visible.',
        },
        {
            title: 'Next step',
            text: 'Use rental and contact pages to compare ownership options before moving toward checkout.',
        },
    ];

    return (
        <section className={isDark ? 'bg-slate-950 py-16 text-white' : 'bg-slate-50 py-16'}>
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="min-w-0">
                        <h2 className={`mb-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {showAggregateRating ? 'Customer Reviews' : 'Planning & Support'}
                        </h2>
                        {showAggregateRating ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <StarRating rating={Math.round(avgRating)} size={20} />
                                <span id={reviewsSummaryId} className={isDark ? 'text-slate-300' : 'text-slate-600'}>{avgRating.toFixed(1)} out of 5 ({reviews.length} reviews)</span>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p id={reviewsSummaryId} className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Support-first product guidance</p>
                                <p className={`text-xs leading-relaxed break-words text-pretty ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {belowThresholdMessage ??
                                        'This page keeps policy, evidence, and support details visible instead of relying on synthetic review volume.'}
                                </p>
                            </div>
                        )}
                    </div>
                    {showAggregateRating ? (
                        <Link href="/contact?intent=review" aria-describedby={reviewsSummaryId} className={isDark ? 'rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200 shrink-0 text-center' : 'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 shrink-0 text-center'}>
                            Write a Review
                        </Link>
                    ) : (
                        <Link href="/contact" aria-describedby={reviewsSummaryId} className={isDark ? 'rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200 shrink-0 text-center' : 'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 shrink-0 text-center'}>
                            Contact Support
                        </Link>
                    )}
                </div>

                {showAggregateRating ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <ReviewCard key={`${review.name}-${review.date}`} {...review} variant={variant} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {guidanceCards.map((card) => (
                            <div key={card.title} className={`rounded-lg border p-6 shadow-none min-w-0 ${
                                isDark ? 'border-white/10 bg-white/[0.045]' : 'border-slate-100 bg-white'
                            }`}>
                                <p className={`mb-3 text-xs font-bold uppercase tracking-wider min-w-0 break-words ${isDark ? 'text-cyan-200' : 'text-[var(--pdp-muted,var(--color-slate-400))]'}`}>{card.title}</p>
                                <p className={`text-sm leading-relaxed min-w-0 break-words text-pretty ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{card.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
