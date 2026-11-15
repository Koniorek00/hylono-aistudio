import { useId, type FocusEventHandler, type MouseEventHandler, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type VisualLinkCardTone = 'dark' | 'light';

export const VISUAL_LINK_CARD_ACTION_STATUS_LABEL = 'Visual link card action status';

type VisualLinkCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  tone?: VisualLinkCardTone;
  className?: string;
  actionLabel?: string;
  ariaDescribedBy?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
};

const toneClasses: Record<
  VisualLinkCardTone,
  {
    root: string;
    eyebrow: string;
    title: string;
    description: string;
    icon: string;
    arrow: string;
  }
> = {
  dark: {
    root:
      'border-white/10 bg-white/[0.06] text-white hover:border-cyan-300/40 hover:bg-white/[0.09] focus-visible:outline-cyan-300',
    eyebrow: 'text-cyan-200',
    title: 'text-white',
    description: 'text-slate-300',
    icon: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
    arrow: 'text-cyan-100',
  },
  light: {
    root:
      'border-slate-200 bg-white text-slate-950 hover:border-cyan-200 hover:shadow-lg focus-visible:outline-slate-950',
    eyebrow: 'text-slate-500',
    title: 'text-slate-950',
    description: 'text-slate-600',
    icon: 'border-slate-200 bg-slate-50 text-slate-700',
    arrow: 'text-slate-950',
  },
};

export function VisualLinkCard({
  href,
  eyebrow,
  title,
  description,
  icon,
  tone = 'dark',
  className = '',
  actionLabel = 'Open path',
  ariaDescribedBy,
  onClick,
  onFocus,
}: VisualLinkCardProps) {
  const classes = toneClasses[tone];
  const visualLinkCardId = useId().replace(/:/g, '');
  const actionStatusId = `visual-link-card-action-status-${visualLinkCardId}`;
  const describedBy = [ariaDescribedBy, actionStatusId].filter(Boolean).join(' ');
  const actionStatus = `${actionLabel} for ${title}. Destination: ${href}. ${description}`;

  return (
    <>
      <Link
        href={href}
        prefetch={false}
        aria-describedby={describedBy}
        onClick={onClick}
        onFocus={onFocus}
        className={`group flex min-h-[10rem] flex-col justify-between rounded-lg border p-5 transition motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${classes.root} ${className}`}
      >
        <span className="flex items-start justify-between gap-4">
          <span>
            <span
              className={`block text-[10px] font-semibold uppercase tracking-[0.2em] ${classes.eyebrow}`}
            >
              {eyebrow}
            </span>
            <span className={`mt-3 block text-base font-bold leading-6 ${classes.title}`}>
              {title}
            </span>
          </span>
          {icon ? (
            <span
              aria-hidden="true"
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${classes.icon}`}
            >
              {icon}
            </span>
          ) : null}
        </span>
        <span className={`mt-5 block text-sm leading-6 ${classes.description}`}>
          {description}
        </span>
        <span
          className={`mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${classes.arrow}`}
        >
          {actionLabel}
          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </span>
      </Link>
      <span
        id={actionStatusId}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${title} ${VISUAL_LINK_CARD_ACTION_STATUS_LABEL}`}
      >
        {actionStatus}
      </span>
    </>
  );
}
