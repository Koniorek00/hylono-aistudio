'use client';

import React from 'react';
import { motion, Variants } from 'motion/react';

interface PreviewRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
}

interface PreviewStaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

interface PreviewStaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

const revealVariants: Record<NonNullable<PreviewRevealProps['direction']>, Variants> = {
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

// Preview routes are screenshot-audited at first paint, so reveal content must render
// immediately instead of waiting for an intersection observer to fire.
export function PreviewReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.7,
  direction = 'up',
}: PreviewRevealProps): React.JSX.Element {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={revealVariants[direction]}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function PreviewStaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
}: PreviewStaggerContainerProps): React.JSX.Element {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function PreviewStaggerItem({
  children,
  className = '',
}: PreviewStaggerItemProps): React.JSX.Element {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
