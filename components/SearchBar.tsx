import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Hexagon } from 'lucide-react';
import { TECH_DETAILS } from '../constants';
import { TechType } from '../types';

interface SearchBarProps {
    onSelectTech: (tech: TechType) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectTech }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsId = useId();

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    // Simple search through tech details
    const searchResults = query.length > 1
        ? Object.values(TECH_DETAILS).filter(tech =>
            tech.name.toLowerCase().includes(query.toLowerCase()) ||
            tech.tagline.toLowerCase().includes(query.toLowerCase()) ||
            tech.descriptionStandard.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    const handleSelect = (techId: TechType) => {
        onSelectTech(techId);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Open technology search"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Search size={20} className="text-slate-600" aria-hidden="true" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50"
                    >
                        <button
                            type="button"
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setIsOpen(false)}
                            aria-label="Dismiss technology search backdrop"
                        />

                        <div className="relative max-w-2xl mx-auto mt-32 px-4">
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-label="Search"
                                initial={{ scale: 0.95, y: -20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: -20 }}
                                className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                                    <Search size={20} className="shrink-0 text-slate-400" aria-hidden="true" />
                                    <div className="relative flex min-w-0 flex-1 items-center">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search technologies, protocols..."
                                            role="combobox"
                                            aria-label="Search technologies, protocols"
                                            aria-autocomplete="list"
                                            aria-expanded={searchResults.length > 0}
                                            aria-controls={searchResults.length > 0 ? resultsId : undefined}
                                            className="w-full bg-transparent pr-8 text-lg text-slate-900 placeholder:text-slate-400 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                                        />
                                        {query.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setQuery('');
                                                    inputRef.current?.focus();
                                                }}
                                                aria-label="Clear search input"
                                                className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500"
                                            >
                                                <X size={16} aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        aria-label="Close search"
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500"
                                    >
                                        <X size={20} aria-hidden="true" />
                                    </button>
                                </div>

                                {searchResults.length > 0 && (
                                    <div id={resultsId} role="listbox" aria-label="Technology search results" className="max-h-80 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                                        {searchResults.map((tech) => (
                                            <button
                                                type="button"
                                                key={tech.id}
                                                role="option"
                                                aria-selected="false"
                                                onClick={() => handleSelect(tech.id)}
                                                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                    <Hexagon size={20} className="text-slate-500" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="break-words font-bold text-slate-900">{tech.name}</h3>
                                                    <p className="break-words text-sm text-slate-500">{tech.tagline}</p>
                                                </div>
                                                <ArrowRight size={16} className="shrink-0 text-slate-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {query.length > 1 && searchResults.length === 0 && (
                                    <div className="p-8 text-center text-sm text-slate-400">
                                        No results found for &ldquo;{query}&rdquo;
                                    </div>
                                )}

                                {query.length <= 1 && (
                                    <div className="p-8 text-center text-sm text-slate-400">
                                        Start typing to search...
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
