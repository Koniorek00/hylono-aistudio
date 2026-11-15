import React from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle, Lock } from 'lucide-react';

interface Certificate {
    id: string;
    title: string;
    description: string;
    level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    progress: number; // 0-100
    totalModules: number;
    completedModules: number;
    earnedDate?: string;
}

const MOCK_CERTIFICATES: Certificate[] = [
    {
        id: 'cert-1',
        title: 'HBOT Operator Level 1',
        description: 'Basic chamber operation and safety protocols',
        level: 'Bronze',
        progress: 100,
        totalModules: 5,
        completedModules: 5,
        earnedDate: '2026-01-15'
    },
    {
        id: 'cert-2',
        title: 'Client Experience Pro',
        description: 'Advanced client comfort and communication',
        level: 'Silver',
        progress: 60,
        totalModules: 5,
        completedModules: 3
    },
    {
        id: 'cert-3',
        title: 'Emergency Response Practice',
        description: 'Critical incident handling and protocols',
        level: 'Gold',
        progress: 20,
        totalModules: 8,
        completedModules: 2
    },
    {
        id: 'cert-4',
        title: 'Operations Practice',
        description: 'Structured review across core Hylono workflow modules',
        level: 'Platinum',
        progress: 0,
        totalModules: 15,
        completedModules: 0
    }
];

const getLevelTone = (level: Certificate['level']) => {
    switch (level) {
        case 'Bronze': return {
            card: 'border-amber-400/[0.22] bg-amber-400/[0.10]',
            badge: 'border-amber-400/[0.25] bg-amber-400/[0.14] text-amber-100',
            progress: 'bg-amber-300',
        };
        case 'Silver': return {
            card: 'border-slate-400/[0.22] bg-white/[0.045]',
            badge: 'border-slate-300/[0.25] bg-white/[0.08] text-slate-100',
            progress: 'bg-slate-300',
        };
        case 'Gold': return {
            card: 'border-yellow-300/[0.22] bg-yellow-300/[0.10]',
            badge: 'border-yellow-300/[0.25] bg-yellow-300/[0.14] text-yellow-100',
            progress: 'bg-yellow-300',
        };
        case 'Platinum': return {
            card: 'border-cyan-400/[0.22] bg-cyan-400/[0.10]',
            badge: 'border-cyan-400/[0.25] bg-cyan-400/[0.14] text-cyan-100',
            progress: 'bg-cyan-300',
        };
    }
};

export const CertificationTracker: React.FC = () => {
    return (
        <div className="space-y-4 text-slate-100">
            <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-bold text-white">
                    <Award className="h-5 w-5 text-amber-200" />
                    Readiness badges
                </h3>
                <span className="rounded-lg border border-white/[0.10] bg-white/[0.045] px-2 py-1 text-xs text-slate-300">1 of 4 earned</span>
            </div>

            <div className="grid gap-3">
                {MOCK_CERTIFICATES.map((cert, idx) => {
                    const tone = getLevelTone(cert.level);

                    return (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative overflow-hidden rounded-lg border p-4 ${tone.card}`}
                        >
                            <div className={`absolute right-0 top-0 rounded-bl-lg border-b border-l px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tone.badge}`}>
                                {cert.level}
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cert.progress === 100 ? 'bg-emerald-400/[0.18] text-emerald-100' : 'bg-white/[0.06] text-slate-300'}`}>
                                    {cert.progress === 100 ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : cert.progress === 0 ? (
                                        <Lock className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-bold">{cert.progress}%</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-white">{cert.title}</h4>
                                    <p className="mb-2 text-xs text-slate-300">{cert.description}</p>

                                    <div
                                        aria-label={`${cert.title} progress`}
                                        aria-valuemax={100}
                                        aria-valuemin={0}
                                        aria-valuenow={cert.progress}
                                        className="mb-1 h-2 overflow-hidden rounded-lg bg-white/[0.08]"
                                        role="progressbar"
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cert.progress}%` }}
                                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                                            className={`h-full ${tone.progress}`}
                                        />
                                    </div>
                                    <div className="flex justify-between gap-3 text-[10px] text-slate-300">
                                        <span>{cert.completedModules}/{cert.totalModules} modules</span>
                                        {cert.earnedDate && (
                                            <span className="text-emerald-200">Earned {cert.earnedDate}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {cert.progress === 100 && (
                                <div className="mt-3 flex gap-2 border-t border-white/[0.10] pt-3">
                                    <span className="text-xs font-semibold text-slate-200">
                                        Sample badge only. Account sign-in is required before any live credential export.
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
