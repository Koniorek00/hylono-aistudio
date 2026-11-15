import React, { type ReactNode } from 'react';

export interface ParametricRow {
  label: string;
  value: ReactNode;
  hint?: string;
  highlight?: boolean;
}

export interface ParametricTableProps {
  rows: ParametricRow[];
  caption?: string;
  className?: string;
}

/**
 * ParametricTable — Clean Technical Specifications & Parameter Matrix
 *
 * Implements clean definition list presentation (<dl>) with delicate stone dividers.
 * Eliminates nested card clutter (Anti-Pattern 3) while maximizing technical authority.
 */
export function ParametricTable({
  rows,
  caption,
  className = '',
}: ParametricTableProps) {
  return (
    <div className={`w-full ${className}`}>
      {caption ? (
        <h4 className="font-editorial text-lg sm:text-xl text-slate-950 mb-3">{caption}</h4>
      ) : null}
      <dl className="divide-y divide-[#EAE4D8] border-y border-[#EAE4D8]">
        {rows.map((row, idx) => (
          <div
            key={row.label || idx}
            className={`py-3.5 flex justify-between items-baseline gap-4 ${
              row.highlight ? 'bg-[#FAF8F5]/80 px-2 rounded-lg' : ''
            }`}
          >
            <dt className="text-sm font-medium text-slate-600 flex flex-col">
              <span>{row.label}</span>
              {row.hint ? <span className="text-xs text-slate-400 mt-0.5">{row.hint}</span> : null}
            </dt>
            <dd className="text-sm font-semibold text-slate-900 text-right shrink-0">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
