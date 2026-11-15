import React from 'react';
import Link from 'next/link';

export interface ProtocolCardData {
  slug: string;
  title: string;
  goalTag: string;
  timePerDay: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  modalities: string[];
  description: string;
}

interface ProtocolCardProps {
  protocol: ProtocolCardData;
  onOpen?: (slug: string) => void;
  href?: string;
  compact?: boolean;
  variant?: 'light' | 'dark';
}

const createProtocolCardIdPart = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'protocol';

export const ProtocolCard: React.FC<ProtocolCardProps> = ({
  protocol,
  onOpen,
  href,
  compact = false,
  variant = 'dark',
}) => {
  const interactiveProps = onOpen
    ? {
        onClick: () => onOpen(protocol.slug),
      }
    : {};
  const isDark = variant === 'dark';
  const cardIdBase = `protocol-card-${createProtocolCardIdPart(protocol.slug)}`;
  const titleId = `${cardIdBase}-title`;
  const metaId = `${cardIdBase}-meta`;
  const descriptionId = `${cardIdBase}-description`;
  const requirementsId = `${cardIdBase}-requirements`;
  const actionStatusId = `${cardIdBase}-action-status`;
  const actionDescriptionIds = [
    metaId,
    descriptionId,
    requirementsId,
    actionStatusId,
  ].join(' ');

  return (
    <Link
      href={href ?? `/protocols/${protocol.slug}`}
      {...interactiveProps}
      aria-label={`Open protocol ${protocol.title}`}
      aria-describedby={actionDescriptionIds}
      className={`group block w-full min-h-11 rounded-lg border p-5 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 motion-reduce:transition-none md:p-6 ${
        isDark
          ? 'border-white/10 bg-white/[0.045] text-white hover:border-cyan-300/45 hover:bg-white/[0.07]'
          : 'border-slate-200/80 bg-white text-slate-900 shadow-xs hover:border-cyan-300 hover:shadow-lg'
      }`}
    >
      <h3
        id={titleId}
        className={`text-lg sm:text-xl font-bold tracking-tight leading-snug break-words transition-colors ${
          isDark ? 'text-white group-hover:text-cyan-200' : 'text-slate-900 group-hover:text-cyan-700'
        }`}
        style={{ fontFamily: 'var(--font-sans), sans-serif' }}
      >
        {protocol.title}
      </h3>

      <div
        id={metaId}
        className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
      >
        <span
          className={`rounded-lg px-2.5 py-1 font-bold uppercase tracking-wider text-[11px] ${
            isDark
              ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
              : 'border border-cyan-200/80 bg-cyan-50/80 text-cyan-800'
          }`}
        >
          {protocol.goalTag}
        </span>
        <span
          className={`rounded-lg border px-2.5 py-1 font-medium ${
            isDark
              ? 'border-white/10 bg-white/5 text-slate-300'
              : 'border-slate-200/70 bg-slate-50/80 text-slate-600'
          }`}
        >
          ⏱ {protocol.timePerDay}/day
        </span>
        <span
          className={`rounded-lg border px-2.5 py-1 font-medium ${
            isDark
              ? 'border-white/10 bg-white/5 text-slate-300'
              : 'border-slate-200/70 bg-slate-50/80 text-slate-600'
          }`}
        >
          📊 {protocol.difficulty}
        </span>
      </div>

      <p
        id={descriptionId}
        className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'} ${compact ? 'line-clamp-2' : ''}`}
      >
        {protocol.description}
      </p>

      <div
        id={requirementsId}
        className={`mt-4 flex flex-wrap items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
      >
        <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>Requires:</span>
        {protocol.modalities.map((modality) => (
          <span
            key={`${protocol.slug}-${modality}`}
            className={`rounded-lg border px-2.5 py-1 font-medium text-xs shadow-2xs ${
              isDark
                ? 'border-white/10 bg-white/[0.045] text-slate-200'
                : 'border-slate-200/80 bg-slate-50/80 text-slate-700'
            }`}
          >
            {modality}
          </span>
        ))}
      </div>

      <span
        id={actionStatusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${protocol.title} protocol card action status`}
        className="sr-only"
      >
        Protocol detail link is ready.
      </span>
    </Link>
  );
};
