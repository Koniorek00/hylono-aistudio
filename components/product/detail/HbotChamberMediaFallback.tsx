import { ClipboardCheck, ImageOff } from 'lucide-react';

interface HbotChamberMediaFallbackProps {
  title: string;
  specifications?: Array<{
    label: string;
    value: string;
  }>;
  className?: string;
}

export function HbotChamberMediaFallback({
  title,
  specifications = [],
  className = '',
}: HbotChamberMediaFallbackProps) {
  const visibleSpecifications = specifications.slice(0, 3);

  return (
    <div
      aria-label={`${title} media fallback`}
      className={`relative flex flex-col justify-between overflow-hidden rounded-lg rounded-[var(--pdp-radius,0.5rem)] border border-white/10 border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-slate-950 bg-[var(--pdp-page,#020617)] p-5 text-[var(--pdp-title,#ffffff)] shadow-none ring-1 ring-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] ${className}`}
      data-testid="hbot-chamber-media-fallback"
      role="group"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.2),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />

      <div className="relative z-10 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--pdp-radius,0.5rem)] border border-cyan-300/25 bg-cyan-300/10 text-[var(--pdp-accent,#cffafe)] shadow-none">
          <ImageOff aria-hidden="true" size={20} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--pdp-accent,#a5f3fc)]">
            Specification-led configuration
          </p>
          <h3 className="mt-2 text-lg font-bold text-white text-[var(--pdp-title,#ffffff)]">{title}</h3>
          <p className="mt-2 max-w-[52ch] text-sm leading-6 text-slate-300 text-[var(--pdp-body,#cbd5e1)]">
            No verified public photo is attached for this configuration. Use the published
            dimensions, pressure range, and setup notes before choosing a rental or purchase path.
          </p>
        </div>
      </div>

      {visibleSpecifications.length > 0 ? (
        <dl className="relative z-10 mt-5 grid gap-2 sm:grid-cols-3">
          {visibleSpecifications.map((specification) => (
            <div
              key={specification.label}
              className="rounded-[var(--pdp-radius,0.5rem)] border border-[var(--pdp-border,color-mix(in_srgb,#ffffff_10%,transparent))] bg-white/[0.045] bg-[var(--pdp-panel,color-mix(in_srgb,#ffffff_4.5%,transparent))] px-3 py-3 shadow-none backdrop-blur-md"
            >
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 text-[var(--pdp-muted,#94a3b8)]">
                <ClipboardCheck aria-hidden="true" size={12} />
                {specification.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold leading-5 text-white text-[var(--pdp-title,#ffffff)]">
                {specification.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
