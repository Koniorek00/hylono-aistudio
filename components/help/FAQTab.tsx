import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Search, ChevronDown, MessageCircle } from 'lucide-react';
import { HELP_FAQ_DATA } from '@/content/help-faq';
import { SmartText } from '../SmartText';
import { MedicalDisclaimer } from '../shared/MedicalDisclaimer';

const HELP_FAQ_SEARCH_HELP_ID = 'help-faq-search-help';
const HELP_FAQ_SEARCH_STATUS_ID = 'help-faq-search-status';
const HELP_FAQ_SEARCH_STATUS_LABEL = 'FAQ search result status';
const HELP_FAQ_ACCORDION_STATUS_ID = 'help-faq-accordion-status';

interface FAQTabProps {
    onOpenContact: () => void;
}

export const FAQTab: React.FC<FAQTabProps> = ({ onOpenContact }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openItem, setOpenItem] = useState<string | null>(null);
    const [faqActionStatus, setFaqActionStatus] = useState('FAQ answers are collapsed.');
    const shouldReduceMotion = useReducedMotion();
    const normalizedSearchQuery = searchQuery.trim();

    const filteredFAQ = HELP_FAQ_DATA.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);
    const filteredAnswerCount = filteredFAQ.reduce((total, category) => total + category.items.length, 0);
    const faqSearchStatusMessage = normalizedSearchQuery
        ? `${filteredAnswerCount} FAQ ${filteredAnswerCount === 1 ? 'answer' : 'answers'} match "${normalizedSearchQuery}".`
        : `${filteredAnswerCount} public FAQ answers are ready to search before opening contact support.`;
    const faqSearchDescriptionIds = `${HELP_FAQ_SEARCH_HELP_ID} ${HELP_FAQ_SEARCH_STATUS_ID}`;
    const toggleFaqItem = (itemId: string, question: string, isOpen: boolean) => {
        setOpenItem(isOpen ? null : itemId);
        setFaqActionStatus(
            isOpen
                ? `Closed FAQ answer for ${question}.`
                : `Opened FAQ answer for ${question}.`
        );
    };

    return (
        <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            className="mx-auto max-w-3xl text-white"
        >
            {/* Search */}
            <div className="mb-12">
                <label htmlFor="help-faq-search" className="block text-sm font-semibold text-white">
                    Search the FAQ library
                </label>
                <p id={HELP_FAQ_SEARCH_HELP_ID} className="mt-1 text-sm leading-6 text-slate-400">
                    Search public support answers before opening a contact request.
                </p>
                <div className="relative mt-3">
                    <Search
                        aria-hidden="true"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200"
                        size={20}
                    />
                    <input
                        id="help-faq-search"
                        type="search"
                        aria-describedby={faqSearchDescriptionIds}
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="min-h-12 w-full rounded-lg border border-white/10 bg-white/[0.045] py-4 pl-12 pr-4 text-white transition-all placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 focus-visible:ring-2 focus-visible:ring-cyan-300"
                    />
                </div>
                <p
                    id={HELP_FAQ_SEARCH_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={HELP_FAQ_SEARCH_STATUS_LABEL}
                    className="mt-3 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-slate-300"
                >
                    {faqSearchStatusMessage}
                </p>
                <p
                    id={HELP_FAQ_ACCORDION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label="FAQ accordion action status"
                    className="sr-only"
                >
                    {faqActionStatus}
                </p>
            </div>

            {/* FAQ Accordion */}
            {filteredFAQ.map((category, ci) => (
                <div key={ci} className="mb-8">
                    <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-cyan-200">{category.category}</h2>
                    {category.evidenceSource && (
                        <p className="mb-3 text-xs text-slate-400">Evidence source: {category.evidenceSource}</p>
                    )}
                    <div className="space-y-3">
                        {category.items.map((item, i) => {
                            const itemId = `${ci}-${i}`;
                            const isOpen = openItem === itemId;
                            return (
                                <div key={item.q} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] transition-colors hover:bg-white/[0.08]">
                                    <button
                                        type="button"
                                        onClick={() => toggleFaqItem(itemId, item.q, isOpen)}
                                        className="flex min-h-11 w-full items-center justify-between px-6 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                        aria-expanded={isOpen}
                                        aria-controls={`help-faq-answer-${itemId}`}
                                        aria-describedby={HELP_FAQ_ACCORDION_STATUS_ID}
                                    >
                                        <span className="font-medium text-white">{item.q}</span>
                                        <ChevronDown aria-hidden="true" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                id={`help-faq-answer-${itemId}`}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-6 pb-4"
                                            >
                                                <div className="border-t border-white/10 px-6 py-4 text-sm leading-relaxed text-slate-300">
                                                    <SmartText>{item.a}</SmartText>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {filteredFAQ.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-8 text-center">
                    <p className="mb-2 font-semibold text-white">No matching questions found</p>
                    <p className="text-sm text-slate-400">Try adjusting your search terms or contact us directly.</p>
                </div>
            )}

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-12 rounded-lg border border-white/10 bg-white/[0.045] p-8 text-center text-white"
            >
                <MessageCircle className="mx-auto mb-4 opacity-80" size={32} />
                <h3
                    className="text-xl font-bold mb-2 break-words"
                    style={{ fontFamily: 'var(--font-sans), sans-serif' }}
                >
                    Need a tailored answer?
                </h3>
                <p id="help-faq-contact-cta-description" className="mb-6 text-sm text-slate-300">Use the contact tab for product matching, delivery questions, or support triage.</p>
                <button
                    type="button"
                    onClick={onOpenContact}
                    aria-controls="tabpanel-contact"
                    aria-describedby="help-faq-contact-cta-description"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                    Open contact options
                </button>
            </motion.div>

            <div className="mt-6">
                <MedicalDisclaimer type="general" compact className="text-center" />
            </div>
        </motion.div>
    );
};
