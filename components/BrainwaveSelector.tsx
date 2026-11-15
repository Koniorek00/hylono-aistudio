import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Brain, Waves, Moon, Zap, X, Check } from 'lucide-react';

type BrainwaveState = 'ALPHA' | 'THETA' | 'DELTA' | 'GAMMA';

interface BrainwaveSelectorProps {
    onSelect: (state: BrainwaveState) => void;
    isOpen: boolean;
    onClose: () => void;
}

const BRAINWAVE_STATES: { id: BrainwaveState; name: string; hz: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
        id: 'GAMMA',
        name: 'Gamma',
        hz: '30-100 Hz',
        description: 'Peak focus, heightened perception, cognitive enhancement',
        icon: <Zap size={18} className="shrink-0" />,
        color: 'from-yellow-400 to-orange-500'
    },
    {
        id: 'ALPHA',
        name: 'Alpha',
        hz: '8-13 Hz',
        description: 'Relaxed focus, flow state, creative visualization',
        icon: <Waves size={18} className="shrink-0" />,
        color: 'from-cyan-400 to-blue-500'
    },
    {
        id: 'THETA',
        name: 'Theta',
        hz: '4-8 Hz',
        description: 'Deep meditation, intuition, subconscious access',
        icon: <Brain size={18} className="shrink-0" />,
        color: 'from-purple-400 to-indigo-500'
    },
    {
        id: 'DELTA',
        name: 'Delta',
        hz: '0.5-4 Hz',
        description: 'Deep rest support, recovery-oriented sleep, restoration',
        icon: <Moon size={18} className="shrink-0" />,
        color: 'from-indigo-400 to-slate-600'
    },
];

export const BrainwaveSelector: React.FC<BrainwaveSelectorProps> = ({ onSelect, isOpen, onClose }) => {
    const [selected, setSelected] = useState<BrainwaveState | null>(null);
    const reducedMotion = useReducedMotion();

    const handleConfirm = useCallback(() => {
        if (selected) {
            onSelect(selected);
            onClose();
        }
    }, [selected, onSelect, onClose]);

    // Handle ESC key dismiss
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                >
                    <button
                        type="button"
                        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                        onClick={onClose}
                        aria-label="Dismiss brainwave selector backdrop"
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="brainwave-selector-title"
                        initial={reducedMotion ? { opacity: 1 } : { scale: 0.94, y: 16 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={reducedMotion ? { opacity: 0 } : { scale: 0.94, y: 16 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border bg-white border-slate-200 flex flex-col max-h-[min(90dvh,640px)] overflow-hidden my-auto"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close brainwave selector"
                            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>

                        {/* Modal Header */}
                        <div className="text-center mb-4 sm:mb-6 shrink-0 pr-6 pl-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2.5 sm:mb-3 bg-slate-100">
                                <Brain className="text-slate-700" size={22} aria-hidden="true" />
                            </div>
                            <h3 id="brainwave-selector-title" className="text-xl sm:text-2xl font-bold mb-1 text-slate-900 futuristic-font">
                                Select Target State
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Choose the target frequency for your protocol session
                            </p>
                        </div>

                        {/* Interactive List with scroll containment */}
                        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2.5 overscroll-contain">
                            {BRAINWAVE_STATES.map((state) => {
                                const isCurrent = selected === state.id;
                                return (
                                    <button
                                        type="button"
                                        key={state.id}
                                        onClick={() => setSelected(state.id)}
                                        className={`w-full p-3 sm:p-3.5 rounded-xl border transition-all text-left flex items-center gap-3 sm:gap-3.5 group min-w-0
                                            ${isCurrent
                                                ? `border-transparent bg-gradient-to-r ${state.color} text-white shadow-md`
                                                : 'border-slate-200 hover:border-slate-400 bg-slate-50/80 hover:bg-slate-100/80'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${isCurrent ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                                            {state.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-sm">{state.name}</span>
                                                <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                                                    {state.hz}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-0.5 leading-snug break-words ${isCurrent ? 'text-white/90' : 'text-slate-500'}`}>
                                                {state.description}
                                            </p>
                                        </div>
                                        {isCurrent && <Check size={18} className="shrink-0 ml-1" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action Footer */}
                        <div className="shrink-0 pt-4 mt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!selected}
                                className={`w-full min-h-12 py-3 sm:py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2
                                    ${selected
                                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.99]'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                Confirm State
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
