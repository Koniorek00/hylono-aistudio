import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Send, ShieldCheck, X } from 'lucide-react';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import type { NexusModuleNavKey } from './nexusNavigation';

interface Message {
    id: string;
    role: 'user' | 'guide';
    content: string;
}

interface AITutorProps {
    videoTitle?: string;
    onClose?: () => void;
}

const GUIDE_HANDOFF_MODULE_KEYS = ['docs', 'team', 'fleet'] satisfies NexusModuleNavKey[];
const GUIDE_HANDOFF_MODULES = GUIDE_HANDOFF_MODULE_KEYS.map((key) => ({
    ...NEXUS_MODULE_NAV_ITEM_BY_KEY[key],
    label: NEXUS_MODULE_NAV_ITEM_BY_KEY[key].label.toLowerCase(),
}));
const getGuideHandoffModule = (key: NexusModuleNavKey) => {
    const module = GUIDE_HANDOFF_MODULES.find((item) => item.key === key);

    if (!module) {
        throw new Error(`Missing Nexus navigation module: ${key}`);
    }

    return module;
};

const documentsModule = getGuideHandoffModule('docs');
const teamModule = getGuideHandoffModule('team');
const fleetModule = getGuideHandoffModule('fleet');

const DEFAULT_GUIDE_RESPONSE = `This public preview can route academy questions to the right Nexus module: ${documentsModule.label} for approved SOPs, ${teamModule.label} for sign-off, and ${fleetModule.label} for device readiness. It does not answer medical, device-setting, or emergency decisions.`;

const TRAINING_GUIDE_ACTION_STATUS_ID = 'training-guide-action-status';

const GUIDE_RESPONSES: Array<{ matcher: RegExp; content: string }> = [
    {
        matcher: /\b(pressure|ata|oxygen|chamber|setting|settings)\b/i,
        content:
            'Use the approved device manual, clinic SOP, and supervisor sign-off for any pressure, oxygen, or chamber setting. This public preview does not provide device settings or client-specific instructions.',
    },
    {
        matcher: /\b(ear|pain|discomfort|symptom|symptoms)\b/i,
        content:
            'Use the clinic escalation path, approved SOP, and qualified professional direction for discomfort or symptoms. Urgent symptoms belong with local emergency care, not this public preview.',
    },
    {
        matcher: /\b(emergency|urgent|incident|injury|injuries)\b/i,
        content:
            'For urgent or emergency situations, use local emergency services and the clinic emergency protocol. Nexus can organize training materials, but this preview does not guide live incidents.',
    },
];

const getGuideResponse = (input: string) =>
    GUIDE_RESPONSES.find((entry) => entry.matcher.test(input))?.content ?? DEFAULT_GUIDE_RESPONSE;

export const AITutor: React.FC<AITutorProps> = ({ videoTitle, onClose }) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [messageCounter, setMessageCounter] = useState(2);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'guide',
            content: videoTitle
                ? `You are viewing "${videoTitle}". I can point you to the right Nexus module, but I cannot answer live procedure, device-setting, or client-specific questions.`
                : `This public academy preview can route questions to approved ${documentsModule.label}, ${teamModule.label} sign-off, or ${fleetModule.label} readiness. It does not replace SOPs, device manuals, or qualified supervision.`
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [actionStatus, setActionStatus] = useState(
        'Ready to route training guide questions to approved Nexus handoffs.'
    );

    useEffect(() => {
        if (!onClose) {
            return undefined;
        }

        const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

        return () => window.clearTimeout(focusTimer);
    }, [onClose]);

    useEffect(() => {
        if (!onClose) {
            return undefined;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSend = () => {
        const trimmedInput = input.trim();

        if (!trimmedInput) {
            setActionStatus('Enter a training guide question before sending.');
            return;
        }

        const userMessageId = `msg-${messageCounter}`;
        const aiMessageId = `msg-${messageCounter + 1}`;
        setMessageCounter((prev) => prev + 2);

        const userMessage: Message = {
            id: userMessageId,
            role: 'user',
            content: trimmedInput
        };

        const response = getGuideResponse(trimmedInput);

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        setActionStatus('Question queued. Training guide is preparing an approved Nexus handoff.');

        setTimeout(() => {
            const guideMessage: Message = {
                id: aiMessageId,
                role: 'guide',
                content: response
            };

            setMessages(prev => [...prev, guideMessage]);
            setIsTyping(false);
            setActionStatus('Training guide response added. Confirm procedures in approved SOPs before live use.');
        }, 1000);
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Training guide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-white/[0.10] bg-slate-950/[0.94] text-slate-100"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.10] bg-slate-950/[0.88] px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5" aria-hidden="true" />
                    <span className="font-bold">Training guide</span>
                    <span className="rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.12] px-2 py-0.5 text-[10px] text-cyan-100">Preview</span>
                </div>
                {onClose && (
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close training guide"
                        aria-describedby={TRAINING_GUIDE_ACTION_STATUS_ID}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white/[0.80] transition hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="h-64 space-y-3 overflow-y-auto bg-slate-950/[0.70] p-4">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm
                                ${msg.role === 'user'
                                    ? 'rounded-br-sm border border-cyan-400/[0.25] bg-cyan-400/[0.16] text-cyan-50'
                                    : 'rounded-bl-sm border border-white/[0.10] bg-white/[0.045] text-slate-200'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="rounded-lg rounded-bl-sm border border-white/[0.10] bg-white/[0.045] px-4 py-2">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-300 rounded-sm animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-slate-300 rounded-sm animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-slate-300 rounded-sm animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.10] bg-slate-950/[0.88] p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        aria-label="Ask training guide"
                        aria-describedby={TRAINING_GUIDE_ACTION_STATUS_ID}
                        placeholder="Ask for a module or handoff..."
                        className="min-w-0 flex-1 rounded-lg border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim()}
                        aria-label="Send training guide question"
                        aria-describedby={TRAINING_GUIDE_ACTION_STATUS_ID}
                        className="inline-flex min-h-11 min-w-10 items-center justify-center rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.16] p-2 text-cyan-50 transition-colors hover:bg-cyan-400/[0.22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:border-white/[0.08] disabled:bg-white/[0.045] disabled:text-slate-500 motion-reduce:transition-none"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p
                    id={TRAINING_GUIDE_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label="Training guide action status"
                    className="mt-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-2.5 py-2 text-[11px] leading-5 text-slate-200"
                >
                    {actionStatus}
                </p>
                <p className="mt-2 text-center text-[10px] text-slate-300">
                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                    Public preview. Confirm procedures in approved SOPs before live use.
                </p>
            </div>
        </motion.div>
    );
};
