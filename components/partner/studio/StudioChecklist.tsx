'use client';

import React from 'react';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  done: boolean;
}

export function StudioChecklist({
  items,
  onToggleItem
}: {
  items: ChecklistItem[];
  onToggleItem?: (id: string) => void;
}) {
  const completedCount = items.filter(i => i.done).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Campaign Launch Checklist
          </h4>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400">
          {completedCount}/{totalCount} ({progressPercent}%)
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleItem && onToggleItem(item.id)}
            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition cursor-pointer"
          >
            {item.done ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Circle size={16} className="text-slate-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className={`text-xs font-semibold ${item.done ? 'text-slate-200' : 'text-slate-400'}`}>
                {item.label}
              </div>
              <div className="text-[11px] text-slate-500">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
