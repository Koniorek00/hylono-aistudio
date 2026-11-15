import React from 'react';
import { FileKey, Globe, Lock, Shield } from 'lucide-react';

export const ComplianceBadges: React.FC = () => {
  return (
    <div className="group relative flex flex-wrap gap-4 sm:gap-6 items-center justify-center rounded-lg border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgb(15,23,42,0.04)] transition-all duration-300 hover:border-cyan-500/20 hover:shadow-[0_8px_30px_rgb(6,182,212,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-cyan-500/0 to-purple-500/0 opacity-0 transition-opacity duration-500 group-hover:from-emerald-500/5 group-hover:via-cyan-500/5 group-hover:to-purple-500/5 group-hover:opacity-100 rounded-lg" aria-hidden="true" />
      
      <div className="relative flex items-center gap-2.5 text-slate-700 min-w-0 transition-colors hover:text-emerald-700">
        <Shield size={18} className="text-emerald-500 shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wider min-w-0 break-words">HIPAA Compliant</span>
      </div>
      <div className="relative flex items-center gap-2.5 text-slate-700 min-w-0 transition-colors hover:text-blue-700">
        <Globe size={18} className="text-blue-500 shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wider min-w-0 break-words">GDPR Ready</span>
      </div>
      <div className="relative flex items-center gap-2.5 text-slate-700 min-w-0 transition-colors hover:text-amber-700">
        <Lock size={18} className="text-amber-500 shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wider min-w-0 break-words">AES-256 Encryption</span>
      </div>
      <div className="relative flex items-center gap-2.5 text-slate-700 min-w-0 transition-colors hover:text-purple-700">
        <FileKey size={18} className="text-purple-500 shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wider min-w-0 break-words">Zero Trust</span>
      </div>
    </div>
  );
};
