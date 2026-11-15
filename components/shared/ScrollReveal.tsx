import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
    once?: boolean;
    amount?: number;
}

const staticVisibleVariant: Variants = {
    hidden: { opacity: 1, x: 0, y: 0, scale: 1 },
    visible: { opacity: 1, x: 0, y: 0, scale: 1 },
};

const reducedMotionMediaQuery = '(prefers-reduced-motion: reduce)';
const reducedMotionClassName =
    'motion-reduce:!transform-none motion-reduce:!opacity-100 motion-reduce:!transition-none';
const staticReducedMotionStyle: React.CSSProperties = { opacity: 1, transform: 'none' };

function readReducedMotionPreference(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia(reducedMotionMediaQuery).matches
    );
}

function usePrefersReducedMotion(): boolean {
    const motionPreference = useReducedMotion();
    const [mediaPreference, setMediaPreference] = React.useState(readReducedMotionPreference);

    React.useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const mediaQuery = window.matchMedia(reducedMotionMediaQuery);
        const syncPreference = () => setMediaPreference(mediaQuery.matches);
        syncPreference();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', syncPreference);
            return () => mediaQuery.removeEventListener('change', syncPreference);
        }

        mediaQuery.addListener(syncPreference);
        return () => mediaQuery.removeListener(syncPreference);
    }, []);

    return motionPreference === true || mediaPreference;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    className = '',
    delay = 0,
    duration = 0.7,
    direction = 'up',
    once = true,
    amount = 0.15,
}) => {
    const shouldReduceMotion = usePrefersReducedMotion();
    const variants: Record<string, Variants> = {
        up: {
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 },
        },
        down: {
            hidden: { opacity: 0, y: -40 },
            visible: { opacity: 1, y: 0 },
        },
        left: {
            hidden: { opacity: 0, x: 48 },
            visible: { opacity: 1, x: 0 },
        },
        right: {
            hidden: { opacity: 0, x: -48 },
            visible: { opacity: 1, x: 0 },
        },
        scale: {
            hidden: { opacity: 0, scale: 0.88 },
            visible: { opacity: 1, scale: 1 },
        },
        none: {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
        },
    };

    return (
        <motion.div
            className={`${className} ${reducedMotionClassName}`.trim()}
            data-scroll-reveal-motion={shouldReduceMotion ? 'reduced' : 'animated'}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={shouldReduceMotion ? 'visible' : undefined}
            style={shouldReduceMotion ? staticReducedMotionStyle : undefined}
            whileInView={shouldReduceMotion ? undefined : 'visible'}
            viewport={{ once, amount }}
            variants={shouldReduceMotion ? staticVisibleVariant : variants[direction]}
            transition={{
                duration: shouldReduceMotion ? 0 : duration,
                delay: shouldReduceMotion ? 0 : delay,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    );
};

interface StaggerContainerProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
    once?: boolean;
    amount?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
    children,
    className = '',
    staggerDelay = 0.1,
    once = true,
    amount = 0.1,
}) => {
    const shouldReduceMotion = usePrefersReducedMotion();

    return (
        <motion.div
            className={`${className} motion-reduce:!transition-none`.trim()}
            data-stagger-motion={shouldReduceMotion ? 'reduced' : 'animated'}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={shouldReduceMotion ? 'visible' : undefined}
            whileInView={shouldReduceMotion ? undefined : 'visible'}
            viewport={{ once, amount }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
                        delayChildren: shouldReduceMotion ? 0 : 0.1,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
};

interface StaggerItemProps {
    children: React.ReactNode;
    className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => {
    const shouldReduceMotion = usePrefersReducedMotion();

    return (
        <motion.div
            className={`${className} ${reducedMotionClassName}`.trim()}
            data-stagger-item-motion={shouldReduceMotion ? 'reduced' : 'animated'}
            style={shouldReduceMotion ? staticReducedMotionStyle : undefined}
            variants={
                shouldReduceMotion
                    ? staticVisibleVariant
                    : {
                        hidden: { opacity: 0, y: 32 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                            },
                        },
                    }
            }
        >
            {children}
        </motion.div>
    );
};
