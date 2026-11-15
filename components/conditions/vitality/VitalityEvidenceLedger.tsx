'use client';

/**
 * VitalityEvidenceLedger — the three cited records, with a focus-trapped drawer.
 *
 * PATTERN CREDIT
 *
 * The drawer re-implements the focus and dismissal contract of
 * `IntentModalAndSlideoverDrawer` (A7) from the `extensions-library` toolbox.
 * Four things are kept from it; its trigger arming, exit-intent detection, swipe
 * physics, and persistent-dismissal layer are not, because a research drawer has
 * none of those needs:
 *
 *  1. The dialog is a single phase-machine instance, so opening a second record
 *     cannot strand the first.
 *  2. Tab is trapped inside the panel and Escape always resolves against the
 *     open dialog.
 *  3. Page content is made `inert` while the dialog is open, and body scroll is
 *     locked and then restored exactly once.
 *  4. Focus returns to the control that opened the dialog.
 *
 * The panel is rendered through a portal onto `document.body`, which is what
 * makes (3) possible: `#main-content` can be marked `inert` without also
 * inerting the dialog itself. The portal is mounted after hydration, so the
 * server and client markup match on first paint.
 *
 * WHY THE LEDGER IS NOT CLIENT-ONLY
 *
 * The study cards — title, journal, year, design, sample size, endpoint, and
 * result summary — are server-rendered plain markup. A reader with JavaScript
 * disabled still sees every fact that matters; the drawer only adds authors,
 * DOI, the source link, and the reading guidance.
 *
 * `prefers-reduced-motion: reduce` drops the panel transition to zero, so the
 * drawer never animates for a reader who has asked for stillness.
 */

import Link from 'next/link';
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { Evidence } from '@/content/evidence';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const MAIN_CONTENT_ID = 'main-content';

interface VitalityEvidenceLedgerProps {
  records: readonly Evidence[];
}

export function VitalityEvidenceLedger({
  records,
}: VitalityEvidenceLedgerProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openRecord = openIndex === null ? null : (records[openIndex] ?? null);
  const titleId = openRecord
    ? `vitality-evidence-drawer-title-${openRecord.id}`
    : undefined;

  const close = useCallback(() => {
    // State only. Focus restoration happens in the drawer's cleanup, AFTER the
    // `inert` attribute comes off #main-content: focusing an element that is
    // still inert is a no-op, which silently dropped focus to the document
    // start on every Escape and every overlay click.
    setOpenIndex(null);
  }, []);

  return (
    <>
      <ul className="mt-6 grid gap-5 md:grid-cols-3">
        {records.map((record, index) => (
          <li key={record.id} className="min-w-0">
            <article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-800">
                {record.studyType}
              </p>
              {/* The publication line keeps the `text-xs` + " - YYYY" shape the
                  shared conditions test reads to prove recency ordering. */}
              <p className="mt-2 text-xs font-medium text-slate-500">
                {record.publication} - {record.year}
              </p>
              <h4 className="mt-3 text-base font-semibold leading-snug tracking-tight text-slate-950 break-words">
                {record.title}
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 break-words">
                {record.resultSummary}
              </p>

              <dl className="mt-4 grid gap-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <dt className="text-slate-500">Sample size</dt>
                  <dd className="text-right font-medium text-slate-800 break-words">
                    {record.sampleSize
                      ? String(record.sampleSize)
                      : 'Not stated in the record'}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <dt className="text-slate-500">Primary endpoint</dt>
                  <dd className="text-right font-medium text-slate-800 break-words">
                    {record.primaryEndpoint}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setOpenIndex(index);
                }}
                aria-haspopup="dialog"
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 pt-2 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
              >
                Inspect the full record
              </button>
            </article>
          </li>
        ))}
      </ul>

      {mounted && openRecord ? (
        <EvidenceDrawer
          record={openRecord}
          onClose={close}
          openerRef={openerRef}
          titleId={titleId}
        />
      ) : null}
    </>
  );
}

function EvidenceDrawer({
  onClose,
  openerRef,
  record,
  titleId,
}: {
  onClose: () => void;
  openerRef: RefObject<HTMLButtonElement | null>;
  record: Evidence;
  titleId: string | undefined;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const main = document.getElementById(MAIN_CONTENT_ID);

    const getFocusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
      ).filter((node) => node.offsetParent !== null);

    getFocusable()[0]?.focus();

    if (main) {
      main.setAttribute('inert', '');
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusable();

      if (focusable.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last?.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Order matters: #main-content is inert while the dialog is open, and
      // focusing an element inside an inert subtree is a no-op. The attribute has
      // to come off before the opener can take focus back.
      main?.removeAttribute('inert');
      openerRef.current?.focus();
    };
  }, [onClose, openerRef]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close the record panel"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/55"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border border-slate-200 bg-[var(--surface-panel)] p-6 sm:rounded-[2rem] md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-800">
              Cited record · {record.studyType} · {record.year}
            </p>
            <h3
              id={titleId}
              className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-950 break-words"
            >
              {record.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
          >
            Close
          </button>
        </div>

        <dl className="mt-5 grid gap-3 text-sm">
          {[
            ['Authors', record.authors],
            ['Journal', record.publication],
            ['Year', String(record.year)],
            ['Design', record.studyType],
            [
              'Sample size',
              record.sampleSize
                ? String(record.sampleSize)
                : 'Not stated in the record',
            ],
            ['Primary endpoint', record.primaryEndpoint],
            ['DOI', record.doi ?? 'Not stated in the record'],
            ['Record id', record.id],
          ].map(([term, value]) => (
            <div
              key={term}
              className="grid gap-1 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4"
            >
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {term}
              </dt>
              <dd className="min-w-0 text-slate-800 break-words">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 break-words">
          {record.resultSummary}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Study design, sample size, and endpoint are the three limits worth
          reading before this record is used for anything. Inclusion here is a
          citation, not an endorsement of its findings.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={record.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
          >
            Open the source record
          </a>
          <Link
            href="/research"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
          >
            Open the research hub
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
