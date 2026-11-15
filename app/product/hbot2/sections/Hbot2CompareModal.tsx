'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { ChamberProduct } from '@/types';
import { priceBookText } from '@/lib/money';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { HbotChamberMediaFallback } from '@/components/product/detail/HbotChamberMediaFallback';

const formatPrice = (value: number): string => priceBookText(value);

const COMPARISON_ROWS: Array<{
  label: string;
  extractor: (chamber: ChamberProduct) => string;
}> = [
  {
    label: 'Type',
    extractor: (chamber) => chamber.type.charAt(0).toUpperCase() + chamber.type.slice(1),
  },
  {
    label: 'Brand',
    extractor: (chamber) => chamber.brandLabel,
  },
  {
    label: 'Variant',
    extractor: (chamber) => chamber.variantLabel,
  },
  {
    label: 'Max Pressure',
    extractor: (chamber) =>
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('pressure'))
        ?.value ?? '—',
  },
  {
    label: 'Diameter / Size',
    extractor: (chamber) =>
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('diameter'))
        ?.value ??
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('dimension'))
        ?.value ??
      '—',
  },
  {
    label: 'Weight',
    extractor: (chamber) =>
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('weight'))
        ?.value ?? '—',
  },
  {
    label: 'Control',
    extractor: (chamber) =>
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('control'))
        ?.value ?? '—',
  },
  {
    label: 'Purchase',
    extractor: (chamber) =>
      chamber.pricing.buy ? formatPrice(chamber.pricing.buy) : 'Contact us',
  },
  {
    label: 'Monthly Rental',
    extractor: (chamber) =>
      chamber.pricing.rent?.monthly
        ? `${formatPrice(chamber.pricing.rent.monthly)}/mo`
        : chamber.transactionModes.includes('rent')
          ? 'Contact us'
          : 'N/A',
  },
];

export interface Hbot2CompareModalProps {
  selectedCompareChambers: ChamberProduct[];
  compareOpenDisabled: boolean;
  showCompareModal: boolean;
  focusRing: string;
  chamberActionStatusId: string;
  onRemoveCompareChamber: (id: string) => void;
  onOpenCompare: () => void;
  onCloseCompare: () => void;
  onActivateChamber: (chamber: ChamberProduct) => void;
}

export function Hbot2CompareModal({
  selectedCompareChambers,
  compareOpenDisabled,
  showCompareModal,
  focusRing,
  chamberActionStatusId,
  onRemoveCompareChamber,
  onOpenCompare,
  onCloseCompare,
  onActivateChamber,
}: Hbot2CompareModalProps) {
  return (
    <>
      {selectedCompareChambers.length > 0 ? (
        <div className="fixed bottom-24 left-1/2 z-30 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 xl:bottom-6">
          <div className="rounded-lg border border-white/10 bg-slate-950/95 px-5 py-3 text-white backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <div className="mr-2 shrink-0">
                <p className="text-xs font-bold text-white">{selectedCompareChambers.length}/3 comparing</p>
                <p className="text-[11px] text-slate-400">HBOT chamber shortlist</p>
              </div>
              <div className="flex flex-1 flex-wrap gap-2">
                {selectedCompareChambers.map((chamber) => (
                  <span
                    key={chamber.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-xs"
                  >
                    {chamber.fullName}
                    <button
                      type="button"
                      onClick={() => onRemoveCompareChamber(chamber.id)}
                      className={`${focusRing} inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.045] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white`}
                      aria-label={`Remove ${chamber.fullName} from comparison`}
                      aria-describedby={chamberActionStatusId}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                disabled={compareOpenDisabled}
                onClick={onOpenCompare}
                aria-describedby={chamberActionStatusId}
                className={`${focusRing} inline-flex min-h-11 items-center rounded-lg px-4 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                  compareOpenDisabled
                    ? 'cursor-not-allowed bg-slate-700 text-slate-400'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                }`}
              >
                Open compare
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showCompareModal ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm"
              onClick={onCloseCompare}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="hbot2-compare-title"
              aria-describedby={chamberActionStatusId}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed inset-x-3 top-[4vh] bottom-[4vh] z-[80] overflow-hidden rounded-lg border border-white/10 bg-slate-950 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    Chamber comparison
                  </p>
                  <h2 id="hbot2-compare-title" className="mt-1 text-lg font-bold text-white">
                    HBOT Chamber Comparison
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onCloseCompare}
                  className={`${focusRing} inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white`}
                  aria-label="Close chamber comparison"
                  aria-describedby={chamberActionStatusId}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="h-[calc(100%-77px)] overflow-auto p-5">
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `minmax(160px, 200px) repeat(${selectedCompareChambers.length}, minmax(220px, 1fr))`,
                  }}
                >
                  <div className="sticky left-0 z-10 rounded-lg bg-slate-950/90 p-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Compare
                  </div>
                  {selectedCompareChambers.map((chamber) => {
                    const chamberImage =
                      chamber.images.find((image) => image.role === 'hero')?.url ??
                      chamber.images[0]?.url ??
                      null;

                    return (
                      <div
                        key={chamber.id}
                        className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
                      >
                        <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/60 p-3">
                          {chamberImage ? (
                            <OptimizedImage
                              src={chamberImage}
                              alt={chamber.fullName}
                              width={320}
                              height={220}
                              sizes="320px"
                              className="h-40 w-full object-contain"
                            />
                          ) : (
                            <HbotChamberMediaFallback
                              title={chamber.fullName}
                              specifications={chamber.specifications}
                              className="h-40 min-h-0 rounded-lg border-white/10 p-4"
                            />
                          )}
                        </div>
                        <div className="mt-4">
                          <h3 className="text-base font-bold text-white">{chamber.fullName}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-300">
                            {chamber.shortDescription}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onActivateChamber(chamber)}
                            aria-describedby={chamberActionStatusId}
                            className={`${focusRing} inline-flex min-h-11 items-center rounded-lg bg-cyan-500 px-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 transition-colors hover:bg-cyan-400`}
                          >
                            Make active
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveCompareChamber(chamber.id)}
                            aria-describedby={chamberActionStatusId}
                            className={`${focusRing} inline-flex min-h-11 items-center rounded-lg border border-white/10 px-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-white/20 hover:bg-white/[0.08]`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2 text-left">
                    <tbody>
                      {COMPARISON_ROWS.map((row) => (
                        <tr key={row.label}>
                          <th className="sticky left-0 whitespace-nowrap rounded-lg bg-slate-900/95 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            {row.label}
                          </th>
                          {selectedCompareChambers.map((chamber) => (
                            <td
                              key={`${chamber.id}-${row.label}`}
                              className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-slate-200"
                            >
                              {row.extractor(chamber)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
