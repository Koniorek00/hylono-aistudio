import React from 'react';
import { Shield, CheckCircle, Award, Globe, FileCheck } from 'lucide-react';

export const TrustBadges: React.FC = () => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-12 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-white/70 px-3.5 py-1.5 rounded-full max-w-full min-w-0">
                <Shield size={16} className="text-amber-500 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 min-w-0 break-words text-center sm:text-left">
                    Product documentation status requires confirmation
                </span>
            </div>
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-white/70 px-3.5 py-1.5 rounded-full max-w-full min-w-0">
                <CheckCircle size={16} className="text-blue-500 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 min-w-0 break-words text-center sm:text-left">
                    See privacy policy for data handling
                </span>
            </div>
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-white/70 px-3.5 py-1.5 rounded-full max-w-full min-w-0 hidden md:inline-flex">
                <Globe size={16} className="text-blue-600 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 min-w-0 break-words text-center sm:text-left">
                    MDR status requires product documentation
                </span>
            </div>
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-white/70 px-3.5 py-1.5 rounded-full max-w-full min-w-0 hidden md:inline-flex">
                <FileCheck size={16} className="text-orange-500 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 min-w-0 break-words text-center sm:text-left">
                    Supporting documents available on request
                </span>
            </div>
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-white/70 px-3.5 py-1.5 rounded-full max-w-full min-w-0">
                <Award size={16} className="text-purple-500 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 min-w-0 break-words text-center sm:text-left">
                    Specification review available
                </span>
            </div>
        </div>
    );
};
