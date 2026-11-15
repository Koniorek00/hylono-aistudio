import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ClipboardCheck, FileText, ShieldCheck } from 'lucide-react';

interface ReadinessCheckpoint {
  label: string;
  status: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}

const READINESS_CHECKPOINTS: ReadinessCheckpoint[] = [
  {
    label: 'SOP review',
    status: 'Ready for supervisor review',
    detail: 'Public preview record only',
    icon: FileText,
    tone: 'text-slate-700 bg-[#f1f5f9] border-[#e2e8f0]',
  },
  {
    label: 'Emergency handoff',
    status: 'Local protocol alignment needed',
    detail: 'Confirm with clinic leadership',
    icon: ShieldCheck,
    tone: 'text-cyan-700 bg-[#06b6d4]/[0.10] border-[#06b6d4]/[0.25]',
  },
  {
    label: 'Training roster',
    status: 'Example seats grouped by role',
    detail: 'No learner identity is shown',
    icon: ClipboardCheck,
    tone: 'text-indigo-700 bg-[#6366f1]/[0.10] border-[#6366f1]/[0.25]',
  },
  {
    label: 'Supervisor sign-off',
    status: 'Not issued from this preview',
    detail: 'Requires real review workflow',
    icon: CheckCircle2,
    tone: 'text-emerald-700 bg-[#10b981]/[0.10] border-[#10b981]/[0.25]',
  },
];

export const Leaderboard: React.FC = () => {
  return (
    <section
      aria-label="Academy readiness checkpoint board"
      className="overflow-hidden rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] text-[#0f172a] shadow-xs"
    >
      <div className="flex items-start gap-3 border-b border-[#e2e8f0] bg-[#ffffff] px-5 py-4 text-[#0f172a]">
        <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-600" />
        <div>
          <h3 className="font-bold text-[#0f172a]">Sample readiness checkpoints</h3>
          <p className="mt-1 text-sm text-[#64748b]">
            Training status examples for planning; no live training record is changed from this preview.
          </p>
        </div>
      </div>
      <div className="divide-y divide-[#f1f5f9]">
        {READINESS_CHECKPOINTS.map((checkpoint, index) => {
          const Icon = checkpoint.icon;

          return (
            <motion.div
              key={checkpoint.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-[#f8fafc] motion-reduce:transition-none"
            >
              <div className={`mt-0.5 rounded-[10px] border p-2 ${checkpoint.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#0f172a]">{checkpoint.label}</p>
                <p className="mt-0.5 text-sm text-[#64748b]">{checkpoint.status}</p>
              </div>
              <p className="max-w-[7.5rem] text-right text-xs leading-5 text-[#64748b]">{checkpoint.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
