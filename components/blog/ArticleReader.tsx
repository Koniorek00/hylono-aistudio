import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X, Clock, Calendar, Share2, Bookmark, BookmarkCheck,
    ArrowLeft, ArrowRight, Volume2, VolumeX, ChevronUp,
    Copy, CheckCircle2, Shield,
    Sparkles, Microscope, ExternalLink
} from 'lucide-react';
import { SmartText } from '../SmartText';
import { BlogPost } from '../../constants/content';
import { toBlogSlug } from '@/lib/blog';

// === ARTICLE READER TYPES ===
interface ArticleReaderProps {
    post: BlogPost;
    onClose: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
    canNavigate: { prev: boolean; next: boolean };
}

export const ARTICLE_READER_ACTION_STATUS_ID = 'article-reader-action-status';
const ARTICLE_READER_ACTION_STATUS_LABEL = 'Article reader action status';
const ARTICLE_READER_READY_STATUS = 'Article reader controls are ready.';

// === ARTICLE READER COMPONENT ===
export const ArticleReader: React.FC<ArticleReaderProps> = ({
    post,
    onClose,
    onNavigate,
    canNavigate
}) => {
    // State
    const [readingProgress, setReadingProgress] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const [readerActionStatus, setReaderActionStatus] = useState(ARTICLE_READER_READY_STATUS);

    const contentRef = useRef<HTMLDivElement>(null);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
    const shareMenuId = useId();

    const announceReaderAction = (message: string) => {
        setReaderActionStatus(message);
    };

    const handleClose = () => {
        announceReaderAction('Closing article reader.');
        onClose();
    };

    const handleNavigate = (direction: 'prev' | 'next') => {
        announceReaderAction(
            direction === 'prev' ? 'Opening previous article.' : 'Opening next article.'
        );
        onNavigate(direction);
    };

    const handleScrollToTop = () => {
        announceReaderAction('Returning to the top of the article.');
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
                const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
                setReadingProgress(Math.min(100, Math.max(0, progress)));
            }
        };

        const container = contentRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    // Text-to-speech
    const toggleReading = () => {
        if (isReading) {
            announceReaderAction('Read-aloud stopped.');
            speechSynthesis.cancel();
            setIsReading(false);
        } else {
            announceReaderAction('Reading article aloud.');
            speechRef.current = new SpeechSynthesisUtterance(
                `${post.title}. ${getFullContent(post)}`
            );
            speechRef.current.rate = 0.9;
            speechRef.current.onend = () => setIsReading(false);
            speechSynthesis.speak(speechRef.current);
            setIsReading(true);
        }
    };

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            speechSynthesis.cancel();
        };
    }, []);

    // Copy link
    const copyLink = () => {
        const clipboardWrite = navigator.clipboard?.writeText(
            window.location.origin + `/blog/${toBlogSlug(post.title)}`
        );

        if (clipboardWrite) {
            clipboardWrite
                .then(() => announceReaderAction('Article link copied.'))
                .catch(() => announceReaderAction('Article link copy was unavailable.'));
        } else {
            announceReaderAction('Article link copy was unavailable.');
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Escape key handler
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // === RENDER ===
    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-reader-title"
            aria-describedby="article-reader-excerpt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
        >
            {/* Reading Progress Bar */}
            <div
                className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50"
                role="progressbar"
                aria-label="Article reading progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(readingProgress)}
            >
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        type="button"
                        onFocus={() => announceReaderAction('Closing article reader.')}
                        onClick={handleClose}
                        aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} aria-hidden="true" />
                        <span className="text-sm font-medium">Back to Hub</span>
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Read Progress */}
                        <span className="text-xs font-mono text-slate-400">
                            {Math.round(readingProgress)}% read
                        </span>

                        {/* Audio Toggle */}
                        <button
                            type="button"
                            onFocus={() => announceReaderAction('Read-aloud controls ready.')}
                            onClick={toggleReading}
                            aria-label={isReading ? 'Stop reading' : 'Read aloud'}
                            aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                            className={`p-2 rounded-lg transition-all ${isReading
                                    ? 'bg-cyan-100 text-cyan-700'
                                    : 'hover:bg-slate-100 text-slate-600'
                                }`}
                        >
                            {isReading ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
                        </button>

                        {/* Bookmark */}
                        <button
                            type="button"
                            onFocus={() => announceReaderAction('Bookmark control ready.')}
                            onClick={() => {
                                const nextBookmarked = !isBookmarked;
                                setIsBookmarked(nextBookmarked);
                                announceReaderAction(
                                    nextBookmarked ? 'Article bookmarked.' : 'Bookmark removed.'
                                );
                            }}
                            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                            aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                            className={`p-2 rounded-lg transition-all ${isBookmarked
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'hover:bg-slate-100 text-slate-600'
                                }`}
                        >
                            {isBookmarked ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
                        </button>

                        {/* Share */}
                        <div className="relative">
                            <button
                                type="button"
                                onFocus={() => announceReaderAction('Share menu control ready.')}
                                onClick={() => {
                                    const nextShareMenu = !showShareMenu;
                                    setShowShareMenu(nextShareMenu);
                                    announceReaderAction(
                                        nextShareMenu ? 'Share menu opened.' : 'Share menu closed.'
                                    );
                                }}
                                aria-label="Share article"
                                aria-expanded={showShareMenu}
                                aria-controls={shareMenuId}
                                aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
                            >
                                <Share2 size={18} aria-hidden="true" />
                            </button>

                            <AnimatePresence>
                                {showShareMenu && (
                                    <motion.div
                                        id={shareMenuId}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onFocus={() => announceReaderAction('Copy article link.')}
                                            onClick={copyLink}
                                            aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 transition-colors"
                                        >
                                            {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Close */}
                        <button
                            type="button"
                            onFocus={() => announceReaderAction('Closing article reader.')}
                            onClick={handleClose}
                            aria-label="Close article reader"
                            aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div
                ref={contentRef}
                className="flex-1 overflow-y-auto pt-20 pb-24 custom-scrollbar"
            >
                <article className="max-w-3xl mx-auto px-6 py-12">
                    {/* Hero */}
                    <header className="mb-12">
                        {/* Category & Meta */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${post.category === 'HBOT' ? 'bg-cyan-100 text-cyan-700' :
                                    post.category === 'PEMF' ? 'bg-purple-100 text-purple-700' :
                                        post.category === 'RLT' ? 'bg-red-100 text-red-700' :
                                            post.category === 'Hydrogen' ? 'bg-sky-100 text-sky-700' :
                                                'bg-slate-100 text-slate-700'
                                }`}>
                                {post.category}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-slate-400">
                                <Clock size={14} /> {post.readTime}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-slate-400">
                                <Calendar size={14} /> {post.date}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 id="article-reader-title" className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        <p id="article-reader-excerpt" className="text-xl text-slate-500 leading-relaxed">
                            <SmartText>{post.excerpt}</SmartText>
                        </p>

                        {/* Trace Badge */}
                        {post.trace_id && (
                            <div className="flex items-center gap-3 mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <Shield size={20} className="text-white" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                        Article scope tracked
                                    </span>
                                    <p className="text-sm text-emerald-600 font-mono">
                                        Trace ID: {post.trace_id}
                                    </p>
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Feature Image */}
                    <div className={`h-64 md:h-80 rounded-2xl bg-gradient-to-br ${post.image} mb-12 flex items-center justify-center`}>
                        <Sparkles size={64} className="text-white/50" />
                    </div>

                    {/* Article Content */}
                    <div className="prose prose-lg prose-slate max-w-none">
                        <SmartText>
                            {getFullContent(post)}
                        </SmartText>
                    </div>

                    {/* Research next step */}
                    {post.trace_id && (
                        <section className="mt-16 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
                                <Microscope size={20} className="text-cyan-500" />
                                Research and next steps
                            </h3>
                            <div className="grid gap-4 text-sm leading-relaxed text-slate-600">
                                <p>
                                    {post.evidenceIds.length > 0
                                        ? 'This article has a route-level citation set. Review the research hub before treating any point as evidence for a broader routine.'
                                        : 'No article-specific citation set is attached here. Treat this reader as planning context and use the research hub before making evidence-led decisions.'}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href="/research"
                                        aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                                        onFocus={() => announceReaderAction('Opening research hub from article reader.')}
                                        onClick={() => announceReaderAction('Opening research hub from article reader.')}
                                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                                    >
                                        Open research hub
                                        <ExternalLink size={14} aria-hidden="true" />
                                    </a>
                                    <a
                                        href="/contact"
                                        aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                                        onFocus={() => announceReaderAction('Opening planning support from article reader.')}
                                        onClick={() => announceReaderAction('Opening planning support from article reader.')}
                                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                                    >
                                        Ask for planning support
                                        <ExternalLink size={14} aria-hidden="true" />
                                    </a>
                                </div>
                            </div>
                        </section>
                    )}
                </article>
            </div>

            {/* Navigation Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        type="button"
                        onFocus={() => announceReaderAction('Previous article control ready.')}
                        onClick={() => handleNavigate('prev')}
                        disabled={!canNavigate.prev}
                        aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${canNavigate.prev
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'opacity-30 cursor-not-allowed text-slate-400'
                            }`}
                    >
                        <ArrowLeft size={16} />
                        Previous Article
                    </button>

                    {/* Scroll to top */}
                    <button
                        type="button"
                        onFocus={() => announceReaderAction('Scroll-to-top control ready.')}
                        onClick={handleScrollToTop}
                        aria-label="Scroll to top"
                        aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                        className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-all"
                    >
                        <ChevronUp size={18} aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onFocus={() => announceReaderAction('Next article control ready.')}
                        onClick={() => handleNavigate('next')}
                        disabled={!canNavigate.next}
                        aria-describedby={ARTICLE_READER_ACTION_STATUS_ID}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${canNavigate.next
                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                : 'opacity-30 cursor-not-allowed text-slate-400'
                            }`}
                    >
                        Next Article
                        <ArrowRight size={16} />
                    </button>
                </div>
            </footer>
            <p
                id={ARTICLE_READER_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={ARTICLE_READER_ACTION_STATUS_LABEL}
                className="sr-only"
            >
                {readerActionStatus}
            </p>
        </motion.div>
    );
};

// === HELPER: Generate full article content ===
function getFullContent(post: BlogPost): string {
    const contentTemplates: Record<string, string> = {
        'HBOT': `
This reader keeps HBOT at article level: useful for orientation, but not a substitute for the canonical research hub, condition guide, or direct support path.

## What this article can support

Use HBOT article content to understand why oxygen routines appear in recovery and vitality planning. Interpret any evidence through study population, pressure context, endpoint, and protocol fit.

## Evidence boundaries

Canonical HBOT records can support narrower source-aware review, but they should not be generalized into care, repair, regeneration, or fixed performance language.

## Practical Applications

The stronger next step is usually one of these:
- Review the recovery or vitality condition guide when the goal is still being defined
- Open the HBOT hub when chamber fit, support, and access are the main questions
- Use contact when planning depends on schedule, tolerance, contraindications, or stack fit

*Note: Hylono technology is presented for wellness planning and educational review. It is not positioned as care equipment, and suitability should be confirmed with a qualified healthcare professional.*
        `,
        'PEMF': `
This reader keeps PEMF at planning level because the current public evidence library does not expose a canonical PEMF evidence record for this article.

## What this article can support

Use PEMF article content to narrow the decision before opening sleep, stress, comfort, product, or support pages. It should not be treated as proof that PEMF creates a fixed outcome.

## Evidence boundaries

This article should not be used to choose frequency, dose, session timing, or settings for implanted electronics, acute concerns, or individualized medical questions.

## Practical Applications

The stronger next step is usually one of these:
- Open the sleep, stress, or comfort guide when the goal is still unclear
- Open the PEMF hub when device-category fit and support context are the main questions
- Use contact when planning depends on tolerance, implanted-electronics screening, or stack fit

*Note: Hylono technology is presented for wellness planning and educational review. It is not positioned as care equipment, and suitability should be confirmed with a qualified healthcare professional.*
        `,
        'RLT': `
This reader keeps red-light content at planning level because this article does not attach a canonical RLT evidence record.

## What this article can support

Use a skin or red-light search as a routing question: comfort guidance, recovery guidance, product category fit, research review, or direct support.

## Evidence boundaries

Do not use this reader as evidence for skin regeneration, collagen changes, wound outcomes, structured effects, wavelength selection, dose, or exposure distance.

## Practical Tips

The stronger next step is usually one of these:
- Open the comfort guide for local routine-fit questions
- Open the recovery guide when red light is being compared inside a broader stack
- Open the red-light hub only when product-category fit is already the question
- Use contact when planning depends on contraindication screening, schedule, tolerance, or stack fit

*Note: Hylono technology is presented for wellness planning and educational review. It is not positioned as care equipment, and suitability should be confirmed with a qualified healthcare professional.*
        `,
        'Hydrogen': `
This reader keeps molecular hydrogen content tied to the current canonical H2 evidence set rather than broad antioxidant or outcome-language claims.

## What this article can support

A hydrogen-water question should be narrowed into source evidence, goal-first planning, hydrogen category context, or support. Delivery method and endpoint matter.

## Evidence boundaries

The cited hydrogen records mix hydrogen-water and hydrogen-inhalation contexts. Do not collapse delivery methods into one claim or generalize narrow populations to everyday wellness visitors.

## Integration Strategies

The stronger next step is usually one of these:
- Open the research hub for source records and limitations
- Open the stress or vitality guide when the goal is still unclear
- Open the hydrogen hub when delivery category and access context are the main questions
- Use contact when planning depends on delivery method, tolerance, schedule, or stack fit

*Note: Hylono technology is presented for wellness planning and educational review. It is not positioned as care equipment, and suitability should be confirmed with a qualified healthcare professional.*
        `,
        'Protocols': `
This reader frames protocol stacking as a planning question, not as proof that a combined PEMF, HBOT, and red-light sequence produces a specific outcome.

## What this article can support

A stack only becomes useful after the visitor knows the primary goal, baseline constraint, time commitment, and safety context. Start with the goal before adding modalities.

## Evidence boundaries

Reviewed HBOT records can support narrower HBOT review, but they do not validate PEMF plus HBOT plus red light as a combined outcome protocol. PEMF and red-light references remain planning references unless reviewed source summaries are attached.

## Customizing Your Stack

The stronger next step is usually one of these:
- Open a condition guide when the goal is still being defined
- Open a protocol page when the goal is clear enough to compare routine shape
- Open product hubs only after each modality has a role to justify
- Use contact when planning depends on schedule, tolerance, contraindication screening, or stack fit

*Note: Hylono technology is presented for wellness planning and educational review. It is not positioned as care equipment, and suitability should be confirmed with a qualified healthcare professional.*
        `
    };

    return contentTemplates[post.category] || post.excerpt;
}

export default ArticleReader;
