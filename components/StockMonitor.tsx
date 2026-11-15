import React from 'react';
import { Info, Package } from 'lucide-react';

interface Props {
    available: number;
    reserved: number;
    allowBackorder: boolean;
    onReserve: () => void;
}

export const StockMonitor: React.FC<Props> = ({ allowBackorder, onReserve }) => {
    return (
        <div className="relative mb-6 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package size={15} className="shrink-0 text-slate-500" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Availability check</span>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-slate-900 sm:text-lg">
                        Confirm before commitment
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Hylono confirms device access, sourcing path, delivery timing, and reservation terms before quote or checkout.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onReserve}
                    className="min-h-11 shrink-0 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                >
                    Check access
                </button>
            </div>

            <div className="mt-3.5 flex min-w-0 items-start gap-2.5 border-t border-slate-200 pt-3">
                <Info size={13} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-slate-500">
                    {allowBackorder
                        ? 'Support can review alternate sourcing or timing if the selected model is not ready for dispatch.'
                        : 'This page does not publish live unit counts or automatic reservation claims.'}
                </p>
            </div>
        </div>
    );
};

