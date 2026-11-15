import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, CheckCircle, Clock, Zap, Save, Sparkles, ArrowRight } from 'lucide-react';
import { TechType } from '../types';
import { useRouter } from 'next/navigation';

interface ProtocolEngineStep {
    title: string;
    desc: string;
    duration?: number; // in minutes
}

interface ProtocolEngineProps {
    steps: ProtocolEngineStep[];
    techName: string;
    accentColor: string;
    onComplete?: () => void;
    nextSynergy?: {
        name: string;
        id: TechType;
    };
}

export const PROTOCOL_ENGINE_ACTION_STATUS_ID = 'protocol-engine-action-status';

export const ProtocolEngine: React.FC<ProtocolEngineProps> = ({ steps, techName, accentColor, onComplete, nextSynergy }) => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isCompleted, setIsCompleted] = useState(false);
    const [actionStatus, setActionStatus] = useState(
        'Protocol controls are ready. Start, reset, and step controls update this session.'
    );

    if (steps.length === 0) {
        return null;
    }

    const step = steps[currentStep];
    if (!step) {
        return null;
    }
    const hasNext = currentStep < steps.length - 1;
    const hasPrev = currentStep > 0;

    // Initialize timer for current step
    useEffect(() => {
        if (step.duration) {
            setTimeLeft(step.duration * 60);
        } else {
            setTimeLeft(0);
        }
        setIsActive(false);
    }, [currentStep, step.duration]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (hasNext) {
                // Auto-advance or wait for user? Let's stay on current step but show completion
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, hasNext]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        if (hasNext) {
            setCurrentStep(prev => prev + 1);
            setActionStatus(`Moved to protocol step ${currentStep + 2} of ${steps.length}.`);
        } else {
            setIsCompleted(true);
            setActionStatus('Protocol session completed. Save, repeat, or continue the stack.');
        }
    };

    const handlePrev = () => {
        if (hasPrev) {
            setCurrentStep(prev => prev - 1);
            setActionStatus(`Returned to protocol step ${currentStep} of ${steps.length}.`);
        }
    };

    const toggleTimer = () => {
        const nextActive = !isActive;
        setIsActive(nextActive);
        setActionStatus(nextActive ? 'Protocol timer started.' : 'Protocol timer paused.');
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(step.duration ? step.duration * 60 : 0);
        setActionStatus('Protocol timer reset for the current step.');
    };

    const repeatSession = () => {
        setCurrentStep(0);
        setIsCompleted(false);
        setActionStatus('Protocol restarted at step 1.');
    };

    const saveSession = () => {
        setActionStatus('Saving protocol session to the dashboard.');
        onComplete?.();
    };

    const continueStack = () => {
        if (!nextSynergy) {
            return;
        }

        setActionStatus(`Opening ${nextSynergy.name} as the next stack session.`);
        router.push(`/product/${nextSynergy.id.toLowerCase()}?launch=true`);
        window.scrollTo(0, 0);
    };

    const progress = step.duration ? ((step.duration * 60 - timeLeft) / (step.duration * 60)) * 100 : 0;

    if (isCompleted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 rounded-lg p-6 sm:p-12 text-center text-white overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={36} className="text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 break-words">Protocol Complete</h2>
                <p className="text-slate-400 mb-6 sm:mb-8 max-w-sm mx-auto text-sm sm:text-base leading-relaxed break-words">
                    Excellent progress. Your {techName} session has been logged to your daily bio-analytics.
                </p>
                <p
                    id={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                    className="sr-only"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {actionStatus}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button
                        type="button"
                        aria-describedby={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                        onClick={repeatSession}
                        onFocus={() => setActionStatus('Repeat Session will restart the protocol.')}
                        className="px-6 sm:px-8 py-3 bg-white/[0.08] hover:bg-white/[0.16] rounded-lg font-bold uppercase tracking-widest text-xs transition-all"
                    >
                        Repeat Session
                    </button>
                    <button
                        type="button"
                        aria-describedby={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                        onClick={saveSession}
                        onFocus={() =>
                            setActionStatus('Save to Dashboard will log this completed protocol.')
                        }
                        className="px-6 sm:px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={16} className="shrink-0" /> Save to Dashboard
                    </button>
                </div>

                {nextSynergy && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.045] rounded-lg p-5 sm:p-6 border border-white/[0.1] text-left">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                                    <Sparkles size={14} className="shrink-0" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Synergy Recommended</span>
                                </div>
                                <h4 className="text-base sm:text-lg font-bold break-words">Stack with {nextSynergy.name}</h4>
                                <p className="text-xs text-slate-400 break-words mt-1">Maximize your cellular window with a follow-up session.</p>
                            </div>
                            <button
                                type="button"
                                aria-describedby={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                                className="w-full sm:w-auto shrink-0 px-5 sm:px-6 py-3 bg-white text-slate-900 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all"
                                onClick={continueStack}
                                onFocus={() =>
                                    setActionStatus(`Continue Stack will open ${nextSynergy.name}.`)
                                }
                            >
                                Continue Stack <ArrowRight size={14} className="shrink-0" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
            {/* Header / Active Step */}
            <div className={`p-4 sm:p-6 ${accentColor} text-white flex flex-wrap justify-between items-center gap-3`}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.2] flex items-center justify-center font-bold shrink-0">
                        {currentStep + 1}
                    </div>
                    <span className="font-bold uppercase tracking-[0.2em] text-[10px] truncate">Active Protocol</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono opacity-80 break-words">
                    <Clock size={12} className="shrink-0" /> SESSION ID: HYLO-{techName.substring(0, 3).toUpperCase()}-{(currentStep + 1).toString().padStart(3, '0')}
                </div>
            </div>

            <div className="p-6 sm:p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Visualizer / Timer Overlay */}
                    <div className="relative aspect-square max-w-[260px] sm:max-w-[300px] md:max-w-none w-full mx-auto flex items-center justify-center">
                        {/* Progress ring background */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className="fill-none stroke-slate-50 stroke-[8]"
                            />
                            <motion.circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className={`fill-none stroke-[8] ${step.duration ? 'stroke-cyan-500' : 'stroke-slate-200'}`}
                                strokeDasharray="100 100"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: 100 - progress }}
                                transition={{ duration: 0.5 }}
                            />
                        </svg>

                        <div className="text-center z-10 p-4">
                            {step.duration ? (
                                <>
                                    <div className="text-4xl sm:text-5xl font-black text-slate-900 futuristic-font mb-2 break-words">
                                        {formatTime(timeLeft)}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Remaining
                                    </div>
                                </>
                            ) : (
                                <Zap size={48} className="text-slate-200 mx-auto" />
                            )}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 break-words">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base break-words">
                                    {step.desc}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                            <p
                                id={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                                className="sr-only"
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {actionStatus}
                            </p>
                            <div className="flex items-center gap-2 sm:gap-3">
                                {step.duration && (
                                    <button
                                        type="button"
                                        aria-label={isActive ? 'Pause protocol timer' : 'Start protocol timer'}
                                        aria-describedby={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                                        onClick={toggleTimer}
                                        onFocus={() =>
                                            setActionStatus(
                                                isActive
                                                    ? 'Pause will stop the protocol timer.'
                                                    : 'Start will run the protocol timer.'
                                            )
                                        }
                                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shrink-0 transition-all ${isActive
                                            ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {isActive ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    aria-label="Reset protocol timer"
                                    aria-describedby={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                                    onClick={resetTimer}
                                    onFocus={() =>
                                        setActionStatus('Reset will restart the timer for this protocol step.')
                                    }
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 hover:bg-slate-100 transition-all border border-slate-100"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    disabled={!hasPrev}
                                    aria-label="Previous protocol step"
                                    aria-describedby={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                                    onFocus={() =>
                                        setActionStatus(
                                            hasPrev
                                                ? 'Previous protocol step is ready.'
                                                : 'Previous protocol step is unavailable.'
                                        )
                                    }
                                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 hover:text-slate-900 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    aria-describedby={PROTOCOL_ENGINE_ACTION_STATUS_ID}
                                    onFocus={() =>
                                        setActionStatus(
                                            hasNext
                                                ? 'Next Step will move to the next protocol step.'
                                                : 'Finish Session will complete this protocol.'
                                        )
                                    }
                                    className="px-4 sm:px-6 h-11 sm:h-12 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all group shrink-0"
                                >
                                    <span className="truncate">{hasNext ? 'Next Step' : 'Finish Session'}</span>
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Progress Bar */}
            <div className="h-2 bg-slate-50 w-full">
                <motion.div
                    className={`h-full ${accentColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
            </div>
        </div>
    );
};
