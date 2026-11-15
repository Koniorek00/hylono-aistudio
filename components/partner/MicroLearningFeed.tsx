import React, { useRef, useState } from 'react';
import { Play, ChevronRight, ChevronLeft, Target, Rocket } from 'lucide-react';
import { MicroVideo, MicroLearningPlayer } from './MicroLearningPlayer';

type Category = 'all' | 'basics' | 'safety' | 'advanced' | 'mastery';

interface ExtendedMicroVideo extends MicroVideo {
    category: Category;
    step?: number; // Recommended path step number
}

const getExportStatusLabel = (video: ExtendedMicroVideo): string => {
    const formats = [video.videoSrc ? 'MP4' : null, video.videoWebmSrc ? 'WebM' : null]
        .filter((value): value is string => Boolean(value))
        .join(' + ');

    if (!formats) {
        return 'Interactive lesson';
    }

    if (video.hasAudio === false) {
        return `Silent ${formats} export`;
    }

    return `${formats} export ready`;
};

const MICRO_LEARNING_ACTION_STATUS_ID = 'academy-micro-learning-action-status';

const CATEGORIES: { id: Category; label: string; icon: string; description: string }[] = [
    { id: 'all', label: 'All', icon: '📚', description: 'Everything' },
    { id: 'basics', label: 'Start Here', icon: '🌱', description: 'Beginner essentials' },
    { id: 'safety', label: 'Safety', icon: '🛡️', description: 'SOP awareness' },
    { id: 'advanced', label: 'Level Up', icon: '⚡', description: 'Intermediate skills' },
    { id: 'mastery', label: 'Readiness', icon: '🏆', description: 'Sample walkthroughs' },
];

// Academy micro-learning catalog with real exports wired in where available.
const MICRO_VIDEOS: ExtendedMicroVideo[] = [
    {
        id: 'mv1',
        title: 'Unboxing: Inhalation Machine Arrival',
        description:
            'Follow the full handoff from courier delivery to opening the box, checking accessories, and setting up the inhalation machine for first use.',
        duration: '0:07',
        thumbnailColor: 'bg-gradient-to-br from-sky-500 to-cyan-700',
        likes: 218,
        views: '1.9k',
        videoSrc: '/videos/academy/inhalation-unboxing.mp4',
        videoWebmSrc: '/videos/academy/inhalation-unboxing.webm',
        posterSrc: '/videos/academy/inhalation-unboxing-poster.jpg',
        hasAudio: false,
        category: 'basics',
        step: 1,
    },
    {
        id: 'mv2',
        title: 'Operator Setup: Ready the Station',
        description:
            'Watch the operator stage the inhalation device, align the mask and tubing, and prepare the station before the client arrives.',
        duration: '0:06',
        thumbnailColor: 'bg-gradient-to-br from-rose-400 to-orange-500',
        likes: 143,
        views: '1.1k',
        videoSrc: '/videos/academy/operator-setup.mp4',
        posterSrc: '/videos/academy/operator-setup-poster.jpg?v=20260413b',
        hasAudio: false,
        category: 'basics',
        step: 2,
        interactions: [
            {
                id: 'i2',
                timestamp: 50,
                type: 'quiz',
                question: 'Before the client sits down, the operator should confirm:',
                options: [
                    { label: 'The device, mask, and tubing are staged and within reach', correct: true },
                    { label: 'The session begins before the station check is complete', correct: false },
                    { label: 'The room lights are turned fully off', correct: false },
                    { label: 'No prep is needed until the client is seated', correct: false }
                ],
                correctIndex: 0
            }
        ]
    },
    {
        id: 'mv3',
        title: 'Post-Session Sanitization',
        description:
            'See the fast reset workflow for wiping the device, resetting the mask area, and making the station ready for the next booking.',
        duration: '0:06',
        thumbnailColor: 'bg-gradient-to-br from-emerald-400 to-teal-600',
        likes: 256,
        views: '2.5k',
        videoSrc: '/videos/academy/post-session-sanitization.mp4',
        posterSrc: '/videos/academy/post-session-sanitization-poster.jpg?v=20260413b',
        hasAudio: false,
        category: 'basics',
        step: 3
    },
    {
        id: 'mv4',
        title: 'Escalation: Comfort Concern',
        description: 'Review how the public preview routes discomfort questions to SOPs, supervisor sign-off, and local care when needed.',
        duration: '4:20',
        thumbnailColor: 'bg-gradient-to-br from-blue-400 to-cyan-500',
        likes: 312,
        views: '3.1k',
        category: 'safety',
        step: 4
    },
    {
        id: 'mv5',
        title: 'Selling the Benefits',
        description:
            'An extended consultation-style clip with spoken portability, active-state, and simplicity cues carried across a full two-stage sales explanation.',
        duration: '0:12',
        thumbnailColor: 'bg-gradient-to-br from-amber-400 to-pink-500',
        likes: 156,
        views: '1.8k',
        videoSrc: '/videos/academy/selling-the-benefits.mp4',
        posterSrc: '/videos/academy/selling-the-benefits-poster.jpg?v=20260413d',
        hasAudio: true,
        category: 'advanced'
    },
    {
        id: 'mv6',
        title: 'Readiness Check: Device Setup Handoff',
        description: 'PREVIEW MODE: Review which approved documents and sign-offs are needed before a device workflow can be practiced.',
        duration: 'CHECKLIST',
        thumbnailColor: 'bg-slate-900 border-2 border-cyan-500/[0.50]',
        likes: 543,
        views: 'Readiness',
        category: 'mastery',
        step: 5,
        interactions: [
            {
                id: 'i_readiness_1',
                timestamp: 20,
                type: 'quiz',
                question: 'Before any device workflow is practiced, the public Academy preview should point operators to:',
                options: [
                    { label: 'Approved SOPs, device manuals, and supervisor sign-off', correct: true },
                    { label: 'A target setting chosen from the preview', correct: false },
                    { label: 'A live client scenario in a public demo', correct: false }
                ],
                correctIndex: 0
            }
        ]
    },
    {
        id: 'mv7',
        title: 'Escalation Drill: Urgent Concern Routing',
        description: 'PREVIEW MODE: Confirm the public route points urgent concerns to local emergency services and clinic protocol instead of live procedure coaching.',
        duration: 'HANDOFF',
        thumbnailColor: 'bg-gradient-to-br from-amber-600 to-slate-900',
        likes: 346,
        views: 'Handoff',
        category: 'safety',
        interactions: [
            {
                id: 'i_handoff_1',
                timestamp: 25,
                type: 'quiz',
                question: 'An operator asks what to do during an urgent concern. The public Academy preview should:',
                options: [
                    { label: 'Direct them to local emergency services and clinic protocol', correct: true },
                    { label: 'Give a live device action sequence', correct: false },
                    { label: 'Ask them to keep practicing inside the public demo', correct: false }
                ],
                correctIndex: 0
            }
        ]
    },
    {
        id: 'mv8',
        title: 'Scenario: Comfort Concern Handoff',
        description: 'PRACTICE MODE: Choose the safest public-preview handoff for a comfort concern without giving procedure instructions.',
        duration: 'SCENARIO',
        thumbnailColor: 'bg-gradient-to-tr from-cyan-900 to-purple-900',
        likes: 1240,
        views: 'Scenario',
        category: 'mastery',
        interactions: [
            {
                id: 'i_branch_1',
                timestamp: 20,
                type: 'branching',
                question: 'A sample learner asks how to handle discomfort during a session. What should this public preview do?',
                options: [
                    { label: 'Point to approved SOPs, supervisor review, and qualified care paths', correct: true },
                    { label: 'Provide a device-setting adjustment', correct: false },
                    { label: 'Frame the choice as a patient outcome', correct: false }
                ]
            }
        ]
    }
];

export const MicroLearningFeed: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeVideoTriggerRef = useRef<HTMLElement | null>(null);
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [showRecommendedPath, setShowRecommendedPath] = useState(false);
    const [actionStatus, setActionStatus] = useState('Academy micro-learning controls ready.');

    const activeVideo = activeVideoIndex === null ? null : MICRO_VIDEOS[activeVideoIndex] ?? null;
    const featuredVideo = MICRO_VIDEOS.find((video) => video.videoSrc || video.videoWebmSrc) ?? null;

    const filteredVideos = activeCategory === 'all'
        ? MICRO_VIDEOS
        : MICRO_VIDEOS.filter(v => v.category === activeCategory);

    const recommendedPath = MICRO_VIDEOS.filter(v => v.step !== undefined).sort((a, b) => (a.step || 0) - (b.step || 0));

    const getDurationLabel = (video: ExtendedMicroVideo): string => video.duration;

    const scroll = (direction: 'left' | 'right') => {
        setActionStatus(`Micro-learning cards scrolled ${direction}.`);

        if (scrollRef.current && typeof scrollRef.current.scrollBy === 'function') {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleVideoClick = (video: ExtendedMicroVideo, trigger?: HTMLElement | null) => {
        activeVideoTriggerRef.current = trigger ?? null;
        setActionStatus(`Opening ${video.title}. ${getExportStatusLabel(video)}.`);
        const globalIndex = MICRO_VIDEOS.findIndex(v => v.id === video.id);
        setActiveVideoIndex(globalIndex >= 0 ? globalIndex : null);
    };

    const handleClose = () => {
        if (activeVideo) {
            setActionStatus(`${activeVideo.title} closed; focus returned to the lesson opener.`);
        }
        setActiveVideoIndex(null);
        window.setTimeout(() => activeVideoTriggerRef.current?.focus(), 0);
    };

    const handleNext = () => {
        if (activeVideoIndex !== null && activeVideoIndex < MICRO_VIDEOS.length - 1) {
            const nextVideo = MICRO_VIDEOS[activeVideoIndex + 1];
            if (nextVideo) {
                setActionStatus(`Opening next lesson: ${nextVideo.title}.`);
            }
            setActiveVideoIndex(activeVideoIndex + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (activeVideoIndex !== null && activeVideoIndex > 0) {
            const previousVideo = MICRO_VIDEOS[activeVideoIndex - 1];
            if (previousVideo) {
                setActionStatus(`Opening previous lesson: ${previousVideo.title}.`);
            }
            setActiveVideoIndex(activeVideoIndex - 1);
        }
    };

    const handleCategorySelect = (category: (typeof CATEGORIES)[number]) => {
        const lessonCount = category.id === 'all'
            ? MICRO_VIDEOS.length
            : MICRO_VIDEOS.filter(video => video.category === category.id).length;

        setActiveCategory(category.id);
        setShowRecommendedPath(false);
        setActionStatus(`${category.label} selected; ${lessonCount} micro-learning lessons shown.`);
    };

    const handleRecommendedPathToggle = () => {
        const nextVisible = !showRecommendedPath;

        setShowRecommendedPath(nextVisible);
        setActionStatus(
            nextVisible
                ? `Recommended journey opened with ${recommendedPath.length} steps.`
                : 'Recommended journey hidden; carousel filters remain available.'
        );
    };

    return (
        <section aria-label="Academy micro-learning carousel" className="relative group text-slate-100">
            <p
                id={MICRO_LEARNING_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Academy micro-learning action status"
                className="sr-only"
            >
                {actionStatus}
            </p>

            {/* Header */}
            <div className="flex justify-between items-end mb-4 px-1">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Micro-Learning
                        <span className="flex items-center gap-1 rounded-lg border border-amber-400/[0.25] bg-amber-400/[0.12] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-100">
                            <span className="animate-pulse">🔥</span> 3 Day Streak
                        </span>
                    </h2>
                    <p className="text-slate-300 text-sm">Quick tips for busy professionals.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        aria-label="Scroll micro-learning cards left"
                        aria-describedby={MICRO_LEARNING_ACTION_STATUS_ID}
                        onClick={() => scroll('left')}
                        className="min-h-11 min-w-11 rounded-lg border border-white/[0.10] bg-white/[0.045] p-1.5 text-slate-300 transition-colors hover:border-cyan-400/[0.28] hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Scroll micro-learning cards right"
                        aria-describedby={MICRO_LEARNING_ACTION_STATUS_ID}
                        onClick={() => scroll('right')}
                        className="min-h-11 min-w-11 rounded-lg border border-white/[0.10] bg-white/[0.045] p-1.5 text-slate-300 transition-colors hover:border-cyan-400/[0.28] hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {featuredVideo && (
                <section className="mb-6 rounded-lg border border-white/[0.10] bg-slate-950/[0.78] p-4 text-white">
                    <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-center">
                        <div className="overflow-hidden rounded-lg border border-white/[0.10] bg-black">
                            <button
                                type="button"
                                aria-label={`Open featured lesson ${featuredVideo.title}`}
                                aria-describedby={MICRO_LEARNING_ACTION_STATUS_ID}
                                onClick={(event) => handleVideoClick(featuredVideo, event.currentTarget)}
                                className="relative aspect-[9/16] w-full overflow-hidden bg-slate-950 text-left"
                            >
                                {featuredVideo.posterSrc && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${featuredVideo.posterSrc})` }}
                                    />
                                )}
                                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/[0.70] via-black/[0.15] to-black/[0.20]" />
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.20] text-white backdrop-blur">
                                        <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                                    </span>
                                </span>
                            </button>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                                Featured real video
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-white">
                                {featuredVideo.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                {featuredVideo.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                                <span>{getDurationLabel(featuredVideo)}</span>
                                <span>{featuredVideo.views} views</span>
                                <span>{getExportStatusLabel(featuredVideo)}</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Category Tabs + Recommended Path Toggle */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                    <button
                        type="button"
                        key={cat.id}
                        aria-describedby={MICRO_LEARNING_ACTION_STATUS_ID}
                        onClick={() => handleCategorySelect(cat)}
                        className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300
                            ${activeCategory === cat.id && !showRecommendedPath
                                ? 'border border-cyan-400/[0.25] bg-slate-950/[0.78] text-white'
                                : 'border border-white/[0.10] bg-white/[0.045] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                            }`}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
                <div className="mx-1 h-6 w-px bg-white/[0.10]" />
                <button
                    type="button"
                    aria-describedby={MICRO_LEARNING_ACTION_STATUS_ID}
                    onClick={handleRecommendedPathToggle}
                    className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300
                        ${showRecommendedPath
                            ? 'border border-cyan-400/[0.35] bg-cyan-400/[0.16] text-cyan-50'
                            : 'border border-cyan-400/[0.25] bg-cyan-400/[0.12] text-cyan-100 hover:bg-cyan-400/[0.18]'
                        }`}
                >
                    <Rocket className="w-4 h-4" />
                    Start Journey
                </button>
            </div>

            {/* Recommended Path Banner */}
            {showRecommendedPath && (
                <section
                    aria-label="Academy micro-learning journey panel"
                    className="mb-4 rounded-lg border border-white/[0.10] bg-slate-950/[0.76] p-4"
                >
                    <div className="flex items-start gap-3 mb-3">
                        <div className="rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.16] p-2">
                            <Target className="w-5 h-5 text-cyan-100" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Your Learning Journey</h3>
                            <p className="text-sm text-slate-300">Follow this recommended path from public preview to supervised practice readiness.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {recommendedPath.map((video, idx) => (
                            <div key={video.id} className="flex items-center shrink-0">
                                <button
                                    type="button"
                                    aria-describedby={MICRO_LEARNING_ACTION_STATUS_ID}
                                    onClick={(event) => handleVideoClick(video, event.currentTarget)}
                                    className="group flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-3 py-2 transition-all hover:border-cyan-400/[0.28] hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.16] text-xs font-bold text-cyan-50">
                                        {video.step}
                                    </span>
                                    <span className="whitespace-nowrap text-sm font-medium text-slate-100 group-hover:text-cyan-100">
                                        {video.title.length > 20 ? video.title.substring(0, 20) + '...' : video.title}
                                    </span>
                                </button>
                                {idx < recommendedPath.length - 1 && (
                                    <ChevronRight className="mx-1 h-4 w-4 text-slate-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {filteredVideos.map((video) => {
                    const fallbackHref = video.videoSrc || video.videoWebmSrc;
                    const cardClassName = 'snap-start shrink-0 w-40 h-64 rounded-lg relative overflow-hidden cursor-pointer group/card transition-transform hover:scale-[1.02] border-0 bg-transparent p-0 text-left block';

                    if (fallbackHref) {
                        return (
                            <a
                                key={video.id}
                                href={fallbackHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleVideoClick(video, event.currentTarget);
                                }}
                                aria-label={`Open ${video.title}`}
                                aria-describedby={MICRO_LEARNING_ACTION_STATUS_ID}
                                className={cardClassName}
                            >
                                {/* Background */}
                                <div className={`absolute inset-0 ${video.posterSrc ? 'bg-slate-950' : video.thumbnailColor}`}>
                                    {video.posterSrc && (
                                        <div
                                            className="h-full w-full bg-cover bg-center"
                                            style={{ backgroundImage: `url(${video.posterSrc})` }}
                                        />
                                    )}
                                </div>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/[0.85] via-black/[0.10] to-black/[0.20]" />

                                {/* Step Badge */}
                                {video.step && (
                                    <div className="absolute top-2 left-2 w-6 h-6 bg-cyan-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                        {video.step}
                                    </div>
                                )}

                                {/* Category Badge */}
                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                    <div className="rounded bg-black/[0.40] px-1.5 py-0.5 text-[10px] capitalize text-white backdrop-blur">
                                        {CATEGORIES.find(c => c.id === video.category)?.icon} {video.category}
                                    </div>
                                    <div className="rounded-lg bg-cyan-400/[0.90] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-950">
                                        Real video
                                    </div>
                                </div>

                                {/* Play Icon */}
                                <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-lg bg-white/[0.20] text-white opacity-0 backdrop-blur transition-opacity group-hover/card:scale-110 group-hover/card:opacity-100">
                                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                    <span className="mb-1 inline-block rounded bg-black/[0.30] px-1.5 py-0.5 text-[10px] text-white/[0.90] backdrop-blur">
                                        {getDurationLabel(video)}
                                    </span>
                                    <h3 className="font-bold text-sm leading-tight break-words mb-0.5">{video.title}</h3>
                                    <p className="text-[10px] text-white/[0.70]">{video.views} views</p>
                                </div>
                            </a>
                        );
                    }

                    return (
                        <button
                            type="button"
                            key={video.id}
                            onClick={(event) => handleVideoClick(video, event.currentTarget)}
                            aria-label={`Open ${video.title}`}
                            aria-describedby={MICRO_LEARNING_ACTION_STATUS_ID}
                            className={cardClassName}
                        >
                        {/* Background */}
                        <div className={`absolute inset-0 ${video.posterSrc ? 'bg-slate-950' : video.thumbnailColor}`}>
                            {video.posterSrc && (
                                <div
                                    className="h-full w-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${video.posterSrc})` }}
                                />
                            )}
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.85] via-black/[0.10] to-black/[0.20]" />

                        {/* Step Badge */}
                        {video.step && (
                            <div className="absolute top-2 left-2 w-6 h-6 bg-cyan-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                {video.step}
                            </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                            <div className="rounded bg-black/[0.40] px-1.5 py-0.5 text-[10px] capitalize text-white backdrop-blur">
                                {CATEGORIES.find(c => c.id === video.category)?.icon} {video.category}
                            </div>
                            {(video.videoSrc || video.videoWebmSrc) && (
                                <div className="rounded-lg bg-cyan-400/[0.90] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-950">
                                    Real video
                                </div>
                            )}
                        </div>

                        {/* Play Icon */}
                        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-lg bg-white/[0.20] text-white opacity-0 backdrop-blur transition-opacity group-hover/card:scale-110 group-hover/card:opacity-100">
                            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <span className="mb-1 inline-block rounded bg-black/[0.30] px-1.5 py-0.5 text-[10px] text-white/[0.90] backdrop-blur">
                                {getDurationLabel(video)}
                            </span>
                            <h3 className="font-bold text-sm leading-tight break-words mb-0.5">{video.title}</h3>
                            <p className="text-[10px] text-white/[0.70]">{video.views} views</p>
                        </div>
                        </button>
                    );
                })}
            </div>

            {/* Player Overlay */}
            {activeVideo && (
                <div className="relative z-[100]">
                    <MicroLearningPlayer
                        video={activeVideo}
                        onClose={handleClose}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                </div>
            )}
        </section>
    );
};
