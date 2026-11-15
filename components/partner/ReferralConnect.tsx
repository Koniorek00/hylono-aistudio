import React, { useState } from 'react';
import { PartnerLayout } from './PartnerLayout';
import {
    Link2,
    Users,
    TrendingUp,
    Copy,
    Plus,
    Search,
    CheckCircle,
    Clock,
    Mail,
    MoreHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';

// Public sample data only; keep commercial terms out of the unauthenticated route.
interface Referral {
    id: string;
    label: string;
    email: string;
    status: 'draft' | 'review' | 'fit_reviewed' | 'closed';
    source: string;
    date: string;
    reviewState: string;
}

const REFERRALS: Referral[] = [
    { id: '1', label: 'Sample lead 01', email: 'sample-lead-01@example.test', status: 'fit_reviewed', source: 'Sample referral route', date: '2026-01-12', reviewState: 'Manual commercial review' },
    { id: '2', label: 'Sample lead 02', email: 'sample-lead-02@example.test', status: 'review', source: 'Public form sample', date: '2026-01-14', reviewState: 'Awaiting account review' },
    { id: '3', label: 'Sample lead 03', email: 'sample-lead-03@example.test', status: 'draft', source: 'Operator handoff sample', date: '2026-01-15', reviewState: 'Draft only' },
];

const REFERRAL_ACTION_STATUS_ID = 'referral-action-status';

const StatusBadge: React.FC<{ status: Referral['status'] }> = ({ status }) => {
    const styles: Record<Referral['status'], string> = {
        draft: 'bg-slate-100 text-slate-600',
        review: 'bg-amber-50 text-amber-700',
        fit_reviewed: 'bg-blue-50 text-blue-700',
        closed: 'bg-slate-100 text-slate-500',
    };
    const labels: Record<Referral['status'], string> = {
        draft: 'Draft',
        review: 'Manual review',
        fit_reviewed: 'Fit reviewed',
        closed: 'Closed',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; trend?: string; positive?: boolean }> = ({ label, value, icon, trend, positive }) => (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500">{icon}</div>
        </div>
        <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {trend && (
                <span className={`text-xs font-bold mb-1 ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {positive ? '+' : ''}{trend}
                </span>
            )}
        </div>
    </div>
);

export const ReferralConnect: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const [actionStatus, setActionStatus] = useState(
        'Referral actions ready. Copy the sample link or open a sample referral action.'
    );
    const referralLink = 'https://hylono.com/ref/CF-4402';

    const copyLink = () => {
        void navigator.clipboard?.writeText(referralLink);
        setCopied(true);
        setActionStatus('Referral link copied. Commercial review remains manual and no payout terms are shown.');
        setTimeout(() => setCopied(false), 2000);
    };

    const prepareReferralAdd = () => {
        setActionStatus('Add referral opened as a sample handoff. Use the live workspace before creating a referral.');
    };

    const openReferralActions = (referral: Referral) => {
        setActionStatus(
            `Referral actions opened for ${referral.label}. No live referral record changed in this preview.`
        );
    };

    return (
        <PartnerLayout title="Referral Connect">
            <div className="space-y-8">
                {/* Referral Link Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Your Referral Link</h2>
                            <p className="text-slate-400 text-sm mb-4">Share this sample link during referral flow review. Live commercial terms stay manual.</p>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-700 rounded-lg px-4 py-2 font-mono text-sm text-cyan-400">
                                    {referralLink}
                                </div>
                                <button
                                    type="button"
                                    onClick={copyLink}
                                    aria-describedby={REFERRAL_ACTION_STATUS_ID}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-400 transition-colors flex items-center gap-2"
                                >
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p
                                id={REFERRAL_ACTION_STATUS_ID}
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                aria-label="Referral action status"
                                className="mt-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-200"
                            >
                                {actionStatus}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Commercial terms</p>
                            <p className="text-3xl font-bold text-emerald-400">Manual review</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Sample Referrals" value="3" icon={<Users className="w-5 h-5" />} />
                    <StatCard label="Commercial Terms" value="Manual review" icon={<Clock className="w-5 h-5" />} />
                    <StatCard label="Fit Reviewed" value="1" icon={<TrendingUp className="w-5 h-5" />} />
                    <StatCard label="Sample Link" value="Ready" icon={<Link2 className="w-5 h-5" />} />
                </div>

                {/* Referrals Table */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Referral Pipeline</h3>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    aria-label="Search referrals"
                                    placeholder="Search referrals..."
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-500 w-64"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={prepareReferralAdd}
                                aria-describedby={REFERRAL_ACTION_STATUS_ID}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Referral
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-3">Contact</div>
                            <div className="col-span-2">Source</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Review state</div>
                            <div className="col-span-1"></div>
                        </div>
                        {REFERRALS.map(referral => (
                            <div key={referral.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-50 last:border-0 hover:bg-cyan-50/30 transition-colors">
                                <div className="col-span-3">
                                    <p className="font-bold text-slate-900">{referral.label}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {referral.email}</span>
                                    </div>
                                </div>
                                <div className="col-span-2 text-sm text-slate-600">{referral.source}</div>
                                <div className="col-span-2 text-sm text-slate-600">{referral.date}</div>
                                <div className="col-span-2"><StatusBadge status={referral.status} /></div>
                                <div className="col-span-2 text-sm font-medium text-slate-600">{referral.reviewState}</div>
                                <div className="col-span-1 text-right">
                                    <button
                                        type="button"
                                        aria-label={`Open referral actions for ${referral.label}`}
                                        onClick={() => openReferralActions(referral)}
                                        aria-describedby={REFERRAL_ACTION_STATUS_ID}
                                        className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PartnerLayout>
    );
};

export default ReferralConnect;
