import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    items: FAQItem[];
}

// Helper function to create a slug from question
const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

export const FAQSection: React.FC<FAQSectionProps> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                <HelpCircle className="text-cyan-500 shrink-0" aria-hidden="true" />
                <span>Technical FAQ</span>
            </h3>
            <div className="space-y-4">
                {items.map((item, index) => {
                    const isOpen = openIndex === index;
                    const itemSlug = slugify(item.question) || String(index);
                    const buttonId = `faq-trigger-${itemSlug}-${index}`;
                    const panelId = `faq-panel-${itemSlug}-${index}`;

                    return (
                        <div
                            key={buttonId}
                            className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300"
                        >
                            <button
                                id={buttonId}
                                type="button"
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full flex items-center justify-between gap-4 p-6 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                            >
                                <span className="font-bold text-slate-800 text-base min-w-0 break-words text-pretty">
                                    {item.question}
                                </span>
                                <span className="ui-transition-fast shrink-0 flex items-center justify-center">
                                    {isOpen ? (
                                        <Minus size={16} className="text-cyan-500" aria-hidden="true" />
                                    ) : (
                                        <Plus size={16} className="text-slate-400" aria-hidden="true" />
                                    )}
                                </span>
                            </button>
                            <div
                                id={panelId}
                                role="region"
                                aria-labelledby={buttonId}
                                className="ui-accordion-grid"
                                data-open={isOpen ? 'true' : 'false'}
                            >
                                <div className="overflow-hidden min-h-0">
                                    <div className="px-6 pb-6 pt-0 text-slate-500 text-sm leading-relaxed break-words text-pretty">
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
