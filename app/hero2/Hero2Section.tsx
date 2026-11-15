'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import analytics from '@/src/lib/analytics';

const MODALITIES = [
  { label: 'HBOT', href: '/product/hbot', color: '#06b6d4' },
  { label: 'PEMF', href: '/product/pemf', color: '#8b5cf6' },
  { label: 'RLT', href: '/product/rlt', color: '#f59e0b' },
  { label: 'Hydrogen', href: '/product/hydrogen', color: '#62b7a4' },
] as const;

const CHANNELS = [
  { label: 'Oxygen', value: 78, color: '#06b6d4' },
  { label: 'Signal', value: 64, color: '#8b5cf6' },
  { label: 'Light', value: 71, color: '#f59e0b' },
  { label: 'Hydrogen', value: 56, color: '#62b7a4' },
] as const;

const STATS = [
  { label: 'Channels', value: '4 modalities side by side' },
  { label: 'Context', value: 'Evidence context on every path' },
  { label: 'Access', value: 'Rental and ownership routes' },
  { label: 'Coverage', value: 'EU support coverage' },
] as const;

const trackHeroCta = (destination: string, ctaRole: 'primary' | 'supporting') => {
  analytics.capture('hero_cta_click', {
    route: '/hero2',
    destination,
    cta_role: ctaRole,
    source: 'hero',
  });
};

function ParticleField({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let frame = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      r: Math.random() * 1.5 + 0.5,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        if (!reduced) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > 1) node.vx *= -1;
          if (node.y < 0 || node.y > 1) node.vy *= -1;
        }

        const px = node.x * width;
        const py = node.y * height;
        ctx.beginPath();
        ctx.arc(px, py, node.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(103, 232, 249, 0.55)';
        ctx.fill();
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const nodeA = nodes[i];
        if (!nodeA) continue;
        for (let j = i + 1; j < nodes.length; j += 1) {
          const nodeB = nodes[j];
          if (!nodeB) continue;
          const ax = nodeA.x * width;
          const ay = nodeA.y * height;
          const bx = nodeB.x * width;
          const by = nodeB.y * height;
          const distance = Math.hypot(ax - bx, ay - by);
          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.22 * (1 - distance / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      if (!reduced) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

export default function Hero2Section() {
  const reduced = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 600], [0, 36]);

  useEffect(() => {
    if (reduced) {
      videoRef.current?.pause();
    }
  }, [reduced]);

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  } as const;

  const item = reduced
    ? ({ hidden: { opacity: 1 }, show: { opacity: 1 } } as const)
    : ({
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
      } as const);

  return (
    <motion.section
      id="hero2"
      aria-labelledby="hero-title"
      variants={container}
      initial="hidden"
      animate="show"
      className="relative isolate flex min-h-[640px] w-full flex-col overflow-hidden bg-[#05080d] text-slate-100 lg:min-h-[calc(100svh-72px-var(--route-breadcrumb-height,56px))] xl:min-h-[calc(100svh-104px-var(--route-breadcrumb-height,56px))]"
    >
      <motion.div
        aria-hidden
        style={reduced ? undefined : { y: backgroundY }}
        className="pointer-events-none absolute inset-x-0 -top-12 bottom-0 overflow-hidden"
      >
        <Image
          src="/images/hero2/hero2-observatory-wide.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-center md:block"
        />
        <Image
          src="/images/hero2/hero2-observatory-tall.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="md:hidden object-cover object-center"
        />
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero/hero2-ambient-poster.jpg"
        >
          <source src="/videos/hero/hero2-ambient.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#05080d]/55 lg:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#05080d] via-[#05080d]/65 to-[#05080d]/5 lg:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05080d]/60 via-transparent to-[#05080d]/85" />
        <ParticleField reduced={reduced} />
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-9 px-6 py-9 sm:px-8 lg:grid lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-12 xl:gap-16">
        <div className="min-w-0 max-w-2xl">
          <motion.p
            variants={item}
            className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 font-heading text-[10px] uppercase tracking-[0.28em] text-cyan-200 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>
            Modality observatory // prototype
          </motion.p>

          <motion.h1
            id="hero-title"
            variants={item}
            className="mt-6 break-words text-3xl leading-[1.1] sm:text-4xl lg:text-5xl xl:text-[3.35rem] xl:leading-[1.06]"
          >
            Mission control for{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
              wellness technology
            </span>
            .
          </motion.h1>

          <motion.p
            id="hero-copy"
            variants={item}
            className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8"
          >
            Oxygen, hydrogen, light, and signal platforms — observed side by side with evidence
            context, protocol planning, rental and ownership paths, and human support in one calm
            view.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/store"
              onClick={() => trackHeroCta('/store', 'primary')}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 text-sm font-semibold uppercase tracking-[0.14em] text-[#04141c] transition hover:bg-cyan-200 hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:w-auto"
            >
              Explore technologies
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/research"
              onClick={() => trackHeroCta('/research', 'supporting')}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100 backdrop-blur transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:w-auto"
            >
              Review research
            </Link>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-7 flex flex-wrap gap-2.5"
            aria-label="Modality shortcuts"
          >
            {MODALITIES.map((modality) => (
              <li key={modality.href}>
                <Link
                  href={modality.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 backdrop-blur transition hover:border-white/35 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: modality.color }}
                    aria-hidden
                  />
                  {modality.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.aside
          variants={item}
          className="relative min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-heading text-[10px] uppercase tracking-[0.26em] text-cyan-200">
              Spectrum monitor
            </p>
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
              Visual simulation
            </span>
          </div>

          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[1.35rem] border border-white/10">
            <Image
              src="/images/hero2/hero2-spectrum-panel.jpg"
              alt="Simulated spectrum waveform panel for the observatory prototype"
              fill
              sizes="(min-width: 1024px) 38vw, 92vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05080d]/75 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
              <p className="font-editorial text-2xl leading-none text-white sm:text-3xl">04 ch</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                240 Hz sample
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-3">
            {CHANNELS.map((channel, index) => (
              <li key={channel.label} className="flex items-center gap-3">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: channel.color }}
                  aria-hidden
                />
                <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-slate-300 sm:w-28">
                  {channel.label}
                </span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
                  <motion.span
                    initial={reduced ? false : { width: 0 }}
                    animate={{ width: `${channel.value}%` }}
                    transition={{ duration: 1.1, delay: 0.35 + index * 0.1, ease: 'easeOut' }}
                    className="block h-full rounded-full"
                    style={{ backgroundColor: channel.color }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right font-editorial text-sm text-slate-200">
                  {channel.value}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-slate-400">
            Simulated readout for interface review only — not a live device measurement.
          </p>
        </motion.aside>
      </div>

      <motion.div
        variants={item}
        className="relative z-10 mx-auto flex w-full max-w-7xl items-stretch gap-5 px-6 pb-6 sm:px-8"
      >
        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white/[0.05] px-5 py-4">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/90">
                {stat.label}
              </dt>
              <dd className="mt-1.5 break-words text-sm font-medium text-slate-100">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <div
          aria-hidden
          className="hidden shrink-0 flex-col items-center justify-end gap-1.5 pb-2 text-slate-400 sm:flex"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown
            size={16}
            className="animate-bounce motion-reduce:animate-none"
            aria-hidden
          />
        </div>
      </motion.div>
    </motion.section>
  );
}
