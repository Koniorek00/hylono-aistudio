import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface BioBodyMapProps {
    scores: {
        recovery: number;
        cognitive: number;
        cellular: number;
        pain: number;
        longevity: number;
    };
    hoveredMetric: string | null;
}

interface MetricBadgeConfig {
    id: string;
    label: string;
    sublabel: string;
    top: string;
    left: string;
    alignClass: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
    value: keyof BioBodyMapProps['scores'];
}

const METRIC_CONFIGS: Record<keyof BioBodyMapProps['scores'], MetricBadgeConfig> = {
    cognitive: {
        id: 'cognitive',
        label: 'Brain/Cognition',
        sublabel: 'Neural Optimization',
        top: '12%',
        left: '50%',
        alignClass: '-translate-x-1/2 sm:translate-x-4 sm:left-[55%]',
        textColor: 'text-cyan-300',
        bgColor: 'bg-slate-900/60',
        borderColor: 'border-cyan-500/20',
        glowColor: '#06b6d4',
        value: 'cognitive'
    },
    longevity: {
        id: 'longevity',
        label: 'Heart/Cardio',
        sublabel: 'Systemic Vitality',
        top: '26%',
        left: '50%',
        alignClass: '-translate-x-1/2 sm:translate-x-4 sm:left-[55%]',
        textColor: 'text-emerald-300',
        bgColor: 'bg-slate-900/60',
        borderColor: 'border-emerald-500/20',
        glowColor: '#10b981',
        value: 'longevity'
    },
    pain: {
        id: 'pain',
        label: 'Immune',
        sublabel: 'Inflammation Regulation',
        top: '42%',
        left: '50%',
        alignClass: '-translate-x-1/2 sm:-translate-x-full sm:left-[45%]',
        textColor: 'text-amber-300',
        bgColor: 'bg-slate-900/60',
        borderColor: 'border-amber-500/20',
        glowColor: '#f59e0b',
        value: 'pain'
    },
    recovery: {
        id: 'recovery',
        label: 'Musculoskeletal',
        sublabel: 'Myofibrillar Repair',
        top: '58%',
        left: '50%',
        alignClass: '-translate-x-1/2 sm:translate-x-4 sm:left-[55%]',
        textColor: 'text-rose-300',
        bgColor: 'bg-slate-900/60',
        borderColor: 'border-rose-500/20',
        glowColor: '#f43f5e',
        value: 'recovery'
    },
    cellular: {
        id: 'cellular',
        label: 'Cellular/Longevity',
        sublabel: 'Mitochondrial Engine',
        top: '76%',
        left: '50%',
        alignClass: '-translate-x-1/2 sm:-translate-x-full sm:left-[45%]',
        textColor: 'text-purple-300',
        bgColor: 'bg-slate-900/60',
        borderColor: 'border-purple-500/20',
        glowColor: '#a855f7',
        value: 'cellular'
    },
};

const DETERMINISTIC_CELL_PARTICLES = [
    { cx: 85, cy: 95, r: 2.2 },
    { cx: 115, cy: 110, r: 1.8 },
    { cx: 90, cy: 160, r: 2.5 },
    { cx: 110, cy: 175, r: 2.0 },
    { cx: 75, cy: 220, r: 1.8 },
    { cx: 125, cy: 230, r: 2.2 },
    { cx: 95, cy: 260, r: 2.4 },
    { cx: 105, cy: 290, r: 1.9 },
    { cx: 80, cy: 330, r: 2.1 },
    { cx: 120, cy: 345, r: 2.3 },
    { cx: 88, cy: 390, r: 1.7 },
    { cx: 112, cy: 405, r: 2.0 },
];

export const BioBodyMap: React.FC<BioBodyMapProps> = ({ scores, hoveredMetric }) => {
    const reducedMotion = useReducedMotion();

    const getOpacity = (metric: string, score: number) => {
        if (hoveredMetric && hoveredMetric !== metric) return 0.15;
        if (hoveredMetric === metric) return 1;
        return 0.4 + (score / 200); 
    };

    const getGlow = (metric: string, color: string) => {
        return hoveredMetric === metric ? `drop-shadow(0 0 16px ${color})` : 'none';
    };

    const activeConfig = (hoveredMetric && hoveredMetric in METRIC_CONFIGS)
        ? METRIC_CONFIGS[hoveredMetric as keyof BioBodyMapProps['scores']]
        : null;

    return (
        <div className="relative w-full rounded-2xl border border-white/10 bg-slate-950 p-6 flex flex-col md:flex-row items-center gap-8 overflow-hidden select-none">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 opacity-60" />

            {/* Telemetry Sidebar */}
            <div className="flex-1 w-full flex flex-col gap-3 z-10">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                    System Telemetry
                </h3>
                {Object.values(METRIC_CONFIGS).map((config) => {
                    const isHovered = hoveredMetric === config.id;
                    const score = scores[config.value];
                    return (
                        <div 
                            key={config.id}
                            className={`relative px-4 py-3 rounded-lg border backdrop-blur-md transition-all duration-300 ${
                                isHovered 
                                    ? `bg-slate-900/80 ${config.borderColor} -translate-y-0.5 shadow-lg` 
                                    : 'bg-white/[0.02] border-white/5 opacity-50'
                            }`}
                        >
                            {isHovered && (
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/[0.04] to-transparent pointer-events-none" />
                            )}
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <p className={`text-xs font-bold leading-tight ${isHovered ? config.textColor : 'text-slate-300'}`}>
                                        {config.label}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                                        {config.sublabel}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-black futuristic-font ${isHovered ? 'text-white' : 'text-slate-500'}`}>
                                        {score}<span className="text-[10px] text-slate-600 ml-0.5">pts</span>
                                    </span>
                                </div>
                            </div>
                            {/* Score Bar */}
                            <div className="mt-2 h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (score / 100) * 100)}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className={`h-full rounded-full`}
                                    style={{ backgroundColor: config.glowColor }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SVG Silhouette */}
            <div className="relative w-full max-w-[240px] md:max-w-[280px] h-[360px] md:h-[400px] flex items-center justify-center z-10">
                <svg
                    viewBox="0 0 200 450"
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full max-h-full object-contain overflow-visible"
                    role="img"
                    aria-label="Interactive biological body map showing health optimization zones"
                >
                    {/* Silhouette Outline */}
                    <path
                        d="M100,30 C115,30 125,40 125,55 C125,65 120,70 120,80 L140,85 L160,150 L145,200 L145,250 L130,300 L135,380 L120,440 L80,440 L65,380 L70,300 L55,250 L55,200 L40,150 L60,85 L80,80 C80,70 75,65 75,55 C75,40 85,30 100,30 Z"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="2"
                        opacity="0.8"
                    />

                    {/* BRAIN (Cognitive) */}
                    <motion.g
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: getOpacity('cognitive', scores.cognitive) }}
                        style={{ filter: getGlow('cognitive', METRIC_CONFIGS.cognitive.glowColor) }}
                        transition={{ duration: 0.4 }}
                    >
                        <circle cx="100" cy="55" r="16" fill={METRIC_CONFIGS.cognitive.glowColor} opacity="0.3" className="mix-blend-screen animate-pulse" />
                        <circle cx="100" cy="55" r="8" fill="#fff" opacity="0.8" />
                    </motion.g>

                    {/* HEART/LUNGS (Longevity/Systemic) */}
                    <motion.g
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: getOpacity('longevity', scores.longevity) }}
                        style={{ filter: getGlow('longevity', METRIC_CONFIGS.longevity.glowColor) }}
                        transition={{ duration: 0.4 }}
                    >
                        <path d="M85,100 Q100,120 115,100 L100,140 Z" fill={METRIC_CONFIGS.longevity.glowColor} opacity="0.6" className="mix-blend-screen" />
                        <circle cx="100" cy="110" r="18" fill="none" stroke={METRIC_CONFIGS.longevity.glowColor} strokeWidth="1" className="animate-ping opacity-20" />
                    </motion.g>

                    {/* MUSCLES (Recovery) */}
                    <motion.g
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: getOpacity('recovery', scores.recovery) }}
                        style={{ filter: getGlow('recovery', METRIC_CONFIGS.recovery.glowColor) }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Shoulders/Arms */}
                        <ellipse cx="60" cy="110" rx="10" ry="20" fill={METRIC_CONFIGS.recovery.glowColor} opacity="0.5" className="mix-blend-screen" />
                        <ellipse cx="140" cy="110" rx="10" ry="20" fill={METRIC_CONFIGS.recovery.glowColor} opacity="0.5" className="mix-blend-screen" />
                        {/* Thighs */}
                        <ellipse cx="80" cy="250" rx="12" ry="40" fill={METRIC_CONFIGS.recovery.glowColor} opacity="0.5" className="mix-blend-screen" />
                        <ellipse cx="120" cy="250" rx="12" ry="40" fill={METRIC_CONFIGS.recovery.glowColor} opacity="0.5" className="mix-blend-screen" />
                    </motion.g>

                    {/* CELLS (Cellular - Distributed) */}
                    <motion.g
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: getOpacity('cellular', scores.cellular) }}
                        style={{ filter: getGlow('cellular', METRIC_CONFIGS.cellular.glowColor) }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Scattered Particles */}
                        {DETERMINISTIC_CELL_PARTICLES.map((p, i) => (
                            <circle
                                key={`cell-particle-${i}`}
                                cx={p.cx}
                                cy={p.cy}
                                r={p.r}
                                fill={METRIC_CONFIGS.cellular.glowColor}
                                opacity="0.8"
                                className="animate-pulse"
                            />
                        ))}
                    </motion.g>

                    {/* JOINTS (Pain) */}
                    <motion.g
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: getOpacity('pain', scores.pain) }}
                        style={{ filter: getGlow('pain', METRIC_CONFIGS.pain.glowColor) }}
                        transition={{ duration: 0.4 }}
                    >
                        <circle cx="140" cy="110" r="5" fill={METRIC_CONFIGS.pain.glowColor} opacity="0.7" />
                        <circle cx="60" cy="110" r="5" fill={METRIC_CONFIGS.pain.glowColor} opacity="0.7" />
                        <circle cx="145" cy="200" r="5" fill={METRIC_CONFIGS.pain.glowColor} opacity="0.7" />
                        <circle cx="55" cy="200" r="5" fill={METRIC_CONFIGS.pain.glowColor} opacity="0.7" />
                        <circle cx="120" cy="300" r="6" fill={METRIC_CONFIGS.pain.glowColor} opacity="0.7" />
                        <circle cx="80" cy="300" r="6" fill={METRIC_CONFIGS.pain.glowColor} opacity="0.7" />
                    </motion.g>
                </svg>

                {/* Viewport-safe Tooltip Overlay for mobile mostly if needed, but sidebar handles the details now. Keep it for spatial context */}
                <div className="absolute inset-0 pointer-events-none overflow-visible hidden md:block">
                    <AnimatePresence>
                        {activeConfig && (
                            <motion.div
                                key={hoveredMetric}
                                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -4 }}
                                transition={{ duration: 0.2 }}
                                style={{ top: activeConfig.top, left: activeConfig.left }}
                                className={`absolute transform ${activeConfig.alignClass} max-w-[200px] z-30`}
                            >
                                <div
                                    className={`px-3 py-1.5 rounded-lg border shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md ${activeConfig.bgColor} ${activeConfig.borderColor}`}
                                >
                                    <p className={`text-xs font-bold leading-tight ${activeConfig.textColor} whitespace-nowrap`}>
                                        {activeConfig.label}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};



