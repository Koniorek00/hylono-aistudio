/**
 * PreviewHeroConcept1 — cloned homepage hero kept route-local so preview redesign can diverge without touching production.
 */
'use client';

import React, { useCallback, useRef } from 'react';
import { Activity, Droplets, Play, Sun, User, Wind } from 'lucide-react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { MagneticButton } from '@/components/shared/MagneticButton';

interface PreviewHeroConcept1Props {
  onLaunchBuilder: () => void;
  onNavigate: (path: string) => void;
  onWatchDemo?: () => void;
}

const MODALITIES = [
  { id: 'oxygen', Icon: Wind, label: 'Oxygen', sublabel: 'O₂', color: '#0891b2', angle: 0 },
  { id: 'light', Icon: Sun, label: 'Light', sublabel: 'RLT', color: '#d97706', angle: 90 },
  {
    id: 'hydrogen',
    Icon: Droplets,
    label: 'Hydrogen',
    sublabel: 'H₂',
    color: '#0ea5e9',
    angle: 180,
  },
  {
    id: 'signal',
    Icon: Activity,
    label: 'Signal',
    sublabel: 'PEMF',
    color: '#7c3aed',
    angle: 270,
  },
] as const;

export function PreviewHeroConcept1({
  onLaunchBuilder,
  onNavigate,
  onWatchDemo,
}: PreviewHeroConcept1Props) {
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 18 });
  const orbX = useTransform(springX, [-1, 1], [-18, 18]);
  const orbY = useTransform(springY, [-1, 1], [-12, 12]);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroTextY = useTransform(scrollY, [0, 600], [0, 60]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!heroRef.current) {
        return;
      }
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
      mouseY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.section
      ref={heroRef}
      aria-describedby="preview-hero-description"
      aria-labelledby="preview-hero-headline"
      className="relative -mt-[72px] flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white md:-mt-[104px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ opacity: heroOpacity }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.cyan.300/8%)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      <motion.div className="absolute" style={{ x: orbX, y: orbY }}>
        <motion.div
          className="absolute rounded-full border border-white/10"
          style={{ width: '70vmin', height: '70vmin', top: '-35vmin', left: '-35vmin' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full border border-cyan-300/15"
          style={{ width: '54vmin', height: '54vmin', top: '-27vmin', left: '-27vmin' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '40vmin',
            height: '40vmin',
            top: '-20vmin',
            left: '-20vmin',
            border: '1px dashed rgba(8,145,178,0.25)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '26vmin',
            height: '26vmin',
            top: '-13vmin',
            left: '-13vmin',
            border: '1px solid rgba(8,145,178,0.15)',
            boxShadow:
              '0 0 30px rgba(8,145,178,0.08), inset 0 0 30px rgba(8,145,178,0.04)',
          }}
          animate={{ rotate: -180 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />

        {MODALITIES.map(({ id, Icon, sublabel, color, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const radius = 35;
          const x = Math.sin(rad) * radius;
          const y = -Math.cos(rad) * radius;
          return (
            <motion.div
              key={id}
              className="absolute flex flex-col items-center"
              style={{
                left: `calc(${x}vmin - 28px)`,
                top: `calc(${y}vmin - 28px)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + angle / 360, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: `${color}18`,
                  borderColor: `${color}45`,
                  boxShadow: `0 0 26px ${color}24`,
                }}
              >
                <Icon size={20} style={{ color }} strokeWidth={1.5} />
              </div>
              <span
                className="mt-1 text-[9px] uppercase tracking-[0.2em] font-semibold"
                style={{ color: `${color}cc` }}
              >
                {sublabel}
              </span>
            </motion.div>
          );
        })}

        <div
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300"
          style={{ boxShadow: '0 0 24px rgba(8,145,178,0.4)' }}
        />
      </motion.div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        style={{ y: heroTextY }}
      >
        <motion.div
          className="flex items-center justify-center gap-4 mb-10"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="h-px w-12 bg-white/20" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-cyan-200/80">
            Guided Wellness Preview
          </span>
          <div className="h-px w-12 bg-white/20" />
        </motion.div>

        <motion.h1
          id="preview-hero-headline"
          className="mb-4 text-[13vmin] font-thin leading-none tracking-[0.25em] text-white md:text-[11vmin]"
          style={{ fontFamily: '"Syncopate", "Outfit", sans-serif' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          HYLONO
        </motion.h1>

        <motion.div
          className="flex items-center justify-center gap-6 my-8"
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="h-px max-w-[100px] flex-1 bg-gradient-to-r from-transparent to-cyan-300/50" />
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          <div className="h-px max-w-[100px] flex-1 bg-gradient-to-l from-transparent to-cyan-300/50" />
        </motion.div>

        <motion.div
          className="mb-10"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="text-2xl font-light leading-relaxed tracking-wide text-slate-300 md:text-3xl">
            Where{' '}
            <span className="relative font-semibold text-white">
              Mind
              <motion.span
                className="absolute -bottom-0.5 left-0 w-full h-px bg-cyan-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              />
            </span>{' '}
            connects with{' '}
            <span className="relative font-semibold text-white">
              Matter
              <motion.span
                className="absolute -bottom-0.5 left-0 w-full h-px bg-purple-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              />
            </span>
          </p>
          <p
            id="preview-hero-description"
            className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base"
          >
            Compare oxygen, hydrogen, red-light, and signal-based systems, pick a rental or
            purchase path, and follow protocols that actually fit a daily routine.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 mb-10"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          {['Noindex preview', 'Rental-first paths', 'Research-linked routes', 'Contact handoff'].map(
            (item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-cyan-300" />
                <span className="text-xs tracking-wide text-slate-300">{item}</span>
              </div>
            )
          )}
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          <MagneticButton
            onClick={onLaunchBuilder}
            className="group flex min-h-11 items-center gap-3 rounded-lg border border-cyan-100/20 bg-cyan-300 px-10 py-4 text-xs font-semibold tracking-[0.2em] text-slate-950 uppercase transition-colors hover:bg-cyan-200"
            strength={0.3}
          >
            <User size={14} />
            Open planner
          </MagneticButton>
          <MagneticButton
            onClick={() => onNavigate('rental')}
            className="group flex min-h-11 items-center gap-3 rounded-lg border border-white/15 bg-white/[0.045] px-10 py-4 text-xs font-semibold tracking-[0.2em] text-slate-100 uppercase transition-all hover:border-cyan-300/60 hover:bg-cyan-300/10 hover:text-white"
            strength={0.25}
          >
            Compare rental paths
          </MagneticButton>
          {onWatchDemo ? (
            <MagneticButton
              onClick={onWatchDemo}
              className="group flex items-center gap-2 px-6 py-4 text-xs tracking-[0.15em] text-slate-300 uppercase transition-colors hover:text-white"
              strength={0.2}
            >
              <Play size={12} strokeWidth={2} /> Watch Demo
            </MagneticButton>
          ) : null}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-slate-400">Scroll</span>
        <motion.div
          className="h-12 w-px bg-gradient-to-b from-cyan-300/70 to-transparent"
          animate={{ scaleY: [1, 0.4, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.section>
  );
}
