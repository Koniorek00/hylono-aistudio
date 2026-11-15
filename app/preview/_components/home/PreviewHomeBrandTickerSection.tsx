import React from 'react';

const topTickerItems = [
  { label: 'Oxygen', className: 'text-white/60' },
  { label: 'Hydrogen', className: 'text-cyan-400/80' },
  { label: 'Light', className: 'text-amber-400/80' },
  { label: 'Signal', className: 'text-purple-400/80' },
  { label: 'Protocol-as-Product', className: 'text-white/60' },
  { label: 'Recovery Planning', className: 'text-emerald-400/80' },
];

const supportTickerItems = [
  { label: 'Research Hub', className: 'text-slate-400' },
  { label: 'Guided Protocols', className: 'text-slate-400' },
  { label: 'Rental Planning', className: 'text-slate-400' },
  { label: 'HBOT · PEMF · RLT · H2', className: 'text-cyan-600/60' },
  { label: 'Support Coverage', className: 'text-slate-400' },
  { label: 'Warranty Guidance', className: 'text-slate-400' },
  { label: 'Returns Policy', className: 'text-slate-400' },
];

export function HomeBrandTickerSection(): React.JSX.Element {
  return (
    <>
      <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {topTickerItems.map((item) => (
            <span
              key={item.label}
              className={`text-xs font-bold uppercase tracking-[0.4em] ${item.className}`}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-slate-800/60 bg-slate-950 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {supportTickerItems.map((item) => (
            <span
              key={item.label}
              className={`text-[10px] font-medium uppercase tracking-[0.3em] ${item.className}`}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
