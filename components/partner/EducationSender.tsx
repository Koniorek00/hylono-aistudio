import React, { useState } from 'react';
import {
    BookOpen,
    Send,
    CheckCircle2,
    PlayCircle,
    FileText,
    Brain
} from 'lucide-react';

const RESOURCES = [
    {
        id: 'hbot-intro',
        title: 'HBOT: What to Expect',
        type: 'video',
        duration: '2 min',
        description: 'A comforting walkthrough of the chamber experience to reduce anxiety.'
    },
    {
        id: 'recovery-science',
        title: 'The Science of Recovery',
        type: 'guide',
        pages: '4 pages',
        description: 'Source-aware overview of oxygen, light therapy, and recovery planning.'
    },
    {
        id: 'sleep-protocol',
        title: 'Sleep Optimization',
        type: 'protocol',
        description: 'Pre and post-session habits to maximize deep sleep.'
    }
];

const EDUCATION_SEND_STATUS_ID = 'education-send-action-status';

export const EducationSender: React.FC = () => {
    const [sent, setSent] = useState(false);
    const [contact, setContact] = useState('');
    const [selectedResource, setSelectedResource] = useState<string>(RESOURCES[0]?.id ?? '');
    const [sendStatus, setSendStatus] = useState('Ready to prepare a sample education resource.');

    const selectedResourceItem = RESOURCES.find((resource) => resource.id === selectedResource) ?? RESOURCES[0];

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const resourceTitle = selectedResourceItem?.title ?? 'Selected resource';
        setSent(true);
        setSendStatus(`Prepared ${resourceTitle} for sample delivery to ${contact}. Sign in for live sending.`);
        setTimeout(() => {
            setSent(false);
            setContact('');
            setSendStatus('Ready to prepare a sample education resource.');
        }, 3000);
    };

    return (
        <div className="rounded-xl border border-white/[0.10] bg-slate-950/[0.78] p-6 shadow-none text-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-cyan-400/[0.12] rounded-lg text-cyan-200 border border-cyan-400/[0.25]">
                    <BookOpen className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-white">Client Education Hub</h3>
                    <p className="text-xs text-slate-300">Send knowledge resources to improve retention</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Resource Selection */}
                <div className="space-y-2">
                    {RESOURCES.map((resource) => (
                        <button
                            key={resource.id}
                            type="button"
                            onClick={() => setSelectedResource(resource.id)}
                            className={`flex w-full min-h-11 items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                                selectedResource === resource.id
                                    ? 'bg-cyan-400/[0.16] border-cyan-400/[0.30] text-cyan-50'
                                    : 'bg-white/[0.045] border-white/[0.10] text-slate-300 hover:border-white/[0.20] hover:text-white'
                            }`}
                            aria-pressed={selectedResource === resource.id}
                        >
                            <div className={`mt-0.5 ${selectedResource === resource.id ? 'text-cyan-200' : 'text-slate-400'}`}>
                                {resource.type === 'video' && <PlayCircle className="w-5 h-5" />}
                                {resource.type === 'guide' && <FileText className="w-5 h-5" />}
                                {resource.type === 'protocol' && <Brain className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold ${selectedResource === resource.id ? 'text-cyan-100' : 'text-slate-200'}`}>
                                    {resource.title}
                                </h4>
                                <p className="text-xs text-slate-300 leading-tight mt-1">{resource.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Sender Form */}
                <form onSubmit={handleSend} className="pt-4 border-t border-white/[0.10]">
                    <label htmlFor="education-sender-contact" className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Send to Client (Mobile or Email)
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="education-sender-contact"
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="(555) 123-4567"
                            className="flex-1 min-h-11 bg-white/[0.045] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-colors"
                            required
                        />
                        <button
                            type="submit"
                            disabled={sent}
                            aria-describedby={EDUCATION_SEND_STATUS_ID}
                            className={`min-h-11 px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                                sent
                                    ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-100'
                                    : 'bg-cyan-400/[0.16] border border-cyan-400/[0.25] text-cyan-50 hover:bg-cyan-400/[0.24]'
                            }`}
                        >
                            {sent ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" /> Sent
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Send
                                </>
                            )}
                        </button>
                    </div>
                    <p
                        id={EDUCATION_SEND_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-label="Education send action status"
                        className="mt-3 rounded-lg border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-xs font-medium text-slate-200"
                    >
                        {sendStatus}
                    </p>
                </form>
            </div>
        </div>
    );
};
