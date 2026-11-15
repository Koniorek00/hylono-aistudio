import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, X, CreditCard, Banknote } from 'lucide-react';
import { formatMoney, formatMoneyParts, priceBookMoney } from '../lib/money';

interface FinancingModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    price: number;
}

export const FINANCING_MODAL_ACTION_STATUS_ID = 'financing-modal-action-status';
export const FINANCING_ENTRY_ACTION_STATUS_ID = 'financing-entry-action-status';

export const FinancingModal: React.FC<FinancingModalProps> = ({ isOpen, onClose, productName, price }) => {
    const [months, setMonths] = useState(24);
    const [actionStatus, setActionStatus] = useState('Financing options are ready. Select a term, apply, or close this dialog.');

    const interestRate = 0.08; // 8% annual
    const monthlyRate = interestRate / 12;
    const monthlyPayment = (price * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalCost = monthlyPayment * months;
    const monthlyPaymentParts = formatMoneyParts(priceBookMoney(Math.round(monthlyPayment)), {
        currencyDisplay: 'code',
    });

    const closeWithStatus = (status: string) => {
        setActionStatus(status);
        onClose();
    };

    const selectTerm = (termMonths: number) => {
        setMonths(termMonths);
        setActionStatus(`Selected ${termMonths} month financing term.`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm"
                        onFocus={() => setActionStatus('Backdrop dismiss control is ready.')}
                        onClick={() => closeWithStatus('Closing financing options from backdrop.')}
                        aria-label="Dismiss financing options backdrop"
                        aria-describedby={FINANCING_MODAL_ACTION_STATUS_ID}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="financing-modal-title"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[90vh] max-w-2xl -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calculator className="text-cyan-500" size={24} aria-hidden="true" />
                                <h2 id="financing-modal-title" className="text-xl font-bold text-slate-900">Financing Options</h2>
                            </div>
                            <button
                                type="button"
                                onFocus={() => setActionStatus('Close financing options control is ready.')}
                                onClick={() => closeWithStatus('Closing financing options.')}
                                aria-label="Close financing options"
                                aria-describedby={FINANCING_MODAL_ACTION_STATUS_ID}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} aria-hidden="true" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-6">{productName}</p>
                            <p
                                id={FINANCING_MODAL_ACTION_STATUS_ID}
                                className="sr-only"
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {actionStatus}
                            </p>

                            <div className="bg-slate-50 rounded-xl p-6 mb-6">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Monthly Payment</p>
                                <p className="text-4xl font-bold text-slate-900">
                                    {monthlyPaymentParts.amount} <span className="text-lg">{monthlyPaymentParts.currency}</span>
                                </p>
                                <p className="text-sm text-slate-400 mt-1">for {months} months</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm font-medium text-slate-700 mb-3">Select Term</p>
                                <div className="flex gap-2">
                                    {[12, 24, 36, 48].map((m) => (
                                        <button
                                            type="button"
                                            key={m}
                                            onFocus={() => setActionStatus(`Select ${m} month financing term.`)}
                                            onClick={() => selectTerm(m)}
                                            aria-describedby={FINANCING_MODAL_ACTION_STATUS_ID}
                                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${months === m
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {m} mo
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Product Price</span>
                                    <span className="font-medium">{formatMoney(priceBookMoney(price), { currencyDisplay: 'code' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Interest</span>
                                    <span className="font-medium">{formatMoney(priceBookMoney(Math.round(totalCost - price)), { currencyDisplay: 'code' })}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t">
                                    <span className="font-bold">Total Cost</span>
                                    <span className="font-bold text-cyan-600">{formatMoney(priceBookMoney(Math.round(totalCost)), { currencyDisplay: 'code' })}</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 mb-6">
                                *Representative example: 8% APR. Subject to credit approval. Terms and conditions apply.
                            </p>

                            <button
                                type="button"
                                onFocus={() => setActionStatus('Apply for financing control is ready.')}
                                onClick={() => closeWithStatus('Opening financing application handoff.')}
                                aria-describedby={FINANCING_MODAL_ACTION_STATUS_ID}
                                className="w-full py-4 bg-cyan-500 text-slate-950 rounded-xl font-bold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <CreditCard size={18} aria-hidden="true" /> Apply for Financing
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Price Display with Financing Option
export const PriceWithFinancing: React.FC<{ price: number; productName: string }> = ({ price, productName }) => {
    const [showModal, setShowModal] = useState(false);
    const [entryStatus, setEntryStatus] = useState('Financing estimate controls are ready.');
    const monthlyEstimate = Math.round(price / 36);

    const openFinancingOptions = () => {
        setEntryStatus(`Opening financing options for ${productName}.`);
        setShowModal(true);
    };

    return (
        <div>
            <div className="text-3xl font-bold text-slate-900">{formatMoney(priceBookMoney(price), { currencyDisplay: 'code' })}</div>
            <p
                id={FINANCING_ENTRY_ACTION_STATUS_ID}
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
                {entryStatus}
            </p>
            <button
                type="button"
                onFocus={() => setEntryStatus('Open financing options will show the monthly estimate dialog.')}
                onClick={openFinancingOptions}
                aria-describedby={FINANCING_ENTRY_ACTION_STATUS_ID}
                className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1 mt-1"
            >
                <Banknote size={14} aria-hidden="true" /> or from {formatMoney(priceBookMoney(monthlyEstimate), { currencyDisplay: 'code' })}/month
            </button>
            <FinancingModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                price={price}
                productName={productName}
            />
        </div>
    );
};

