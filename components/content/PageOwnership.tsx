import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export interface PageOwnershipItem {
  label: string;
  value: string;
  detail?: string;
}

export interface PageOwnershipAction {
  href: string;
  label: string;
}

const createPageOwnershipIdPart = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

interface PageOwnershipProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  items: PageOwnershipItem[];
  actions?: PageOwnershipAction[];
  note?: string;
  className?: string;
  variant?: 'default' | 'dark';
}

export function PageOwnership({
  eyebrow = 'Ownership and freshness',
  title = 'Reviewed for clarity and fit',
  description,
  items,
  actions = [],
  note,
  className = '',
  variant = 'default',
}: PageOwnershipProps) {
  const isDark = variant === 'dark';
  const idBase = `page-ownership-${createPageOwnershipIdPart(`${eyebrow}-${title}`)}`;
  const titleId = `${idBase}-title`;
  const descriptionId = description ? `${idBase}-description` : undefined;
  const noteId = note ? `${idBase}-note` : undefined;
  const actionStatusId = actions.length > 0 ? `${idBase}-action-status` : undefined;
  const actionDescriptionIds = [descriptionId, noteId, actionStatusId]
    .filter(Boolean)
    .join(' ');
  const styles = {
    container: isDark
      ? 'rounded-lg border border-white/10 bg-white/[0.045] p-6'
      : 'rounded-lg border border-slate-200 bg-slate-50 p-6',
    header: isDark ? 'text-white' : 'text-slate-900',
    icon: isDark
      ? 'rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-200'
      : 'rounded-lg bg-white p-2 text-cyan-700',
    eyebrow: isDark
      ? 'text-xs font-mono uppercase tracking-[0.22em] text-cyan-200'
      : 'text-xs font-mono uppercase tracking-[0.22em] text-slate-600',
    description: isDark ? 'mt-3 text-xs sm:text-sm leading-relaxed text-slate-300 font-light' : 'mt-3 text-xs sm:text-sm leading-relaxed text-slate-700 font-light',
    item: isDark
      ? 'rounded-lg border border-white/10 bg-white/[0.045] p-4 flex flex-col justify-between transition-colors hover:border-white/20'
      : 'rounded-lg border border-white bg-white p-4 flex flex-col justify-between transition-colors hover:border-slate-200',
    itemLabel: isDark ? 'text-[11px] font-mono uppercase tracking-wider text-cyan-300/80 font-medium' : 'text-[11px] font-mono uppercase tracking-wider text-cyan-800 font-medium',
    itemValue: isDark ? 'mt-1.5 text-sm sm:text-base font-semibold text-white tracking-tight' : 'mt-1.5 text-sm sm:text-base font-semibold text-slate-950 tracking-tight',
    itemDetail: isDark ? 'mt-2 text-xs leading-relaxed text-slate-300 font-light' : 'mt-2 text-xs leading-relaxed text-slate-600 font-light',
    note: isDark ? 'mt-5 text-xs text-slate-400 font-mono leading-relaxed' : 'mt-5 text-xs text-slate-500 font-mono leading-relaxed',
    action: isDark
      ? 'inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/[0.12] hover:border-cyan-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none'
      : 'inline-flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-xs transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 motion-reduce:transition-none',
  };

  return (
    <aside
      aria-describedby={[descriptionId, noteId].filter(Boolean).join(' ') || undefined}
      aria-labelledby={titleId}
      className={`${styles.container} ${className}`.trim()}
    >
      <div className={`flex items-center gap-3 ${styles.header}`}>
        <div className={styles.icon}>
          <ShieldCheck size={18} />
        </div>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2
            id={titleId}
            className="mt-1 text-base sm:text-xl font-bold tracking-tight leading-snug break-words"
            style={{ fontFamily: 'var(--font-sans), sans-serif' }}
          >
            {title}
          </h2>
        </div>
      </div>

      {description ? (
        <p id={descriptionId} className={styles.description}>{description}</p>
      ) : null}

      <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className={styles.item}>
            <div>
              <dt className={styles.itemLabel}>{item.label}</dt>
              <dd className={styles.itemValue}>{item.value}</dd>
            </div>
            {/*
              This detail is a second <dd>, not a <p>. A <div> is a permitted child of <dl>,
              but its contents must still be a valid dt/dd group -- a <p> in that position
              makes the list invalid, which axe reported as a SERIOUS `definition-list`
              violation on /, /store and /blog simultaneously (one shared component, three
              routes; proof 1009824). A <dt> may be followed by several <dd> elements, so a
              second <dd> is also the semantically correct home for further description.
              Do not turn this back into a <p> or a <span>.
            */}
            {item.detail ? <dd className={styles.itemDetail}>{item.detail}</dd> : null}
          </div>
        ))}
      </dl>

      {note ? <p id={noteId} className={styles.note}>{note}</p> : null}

      {actionStatusId ? (
        <p
          id={actionStatusId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${title} ownership action status`}
          className="sr-only"
        >
          Ownership action links are ready.
        </p>
      ) : null}

      {actions.length > 0 ? (
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap gap-3 text-sm font-semibold">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              aria-describedby={actionDescriptionIds}
              className={styles.action}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
