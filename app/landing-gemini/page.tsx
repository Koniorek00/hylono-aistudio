'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Gauge, 
  Sparkles, 
  Layers, 
  Maximize2, 
  Sliders, 
  ChevronRight,
  Info,
  CheckCircle2,
  Cpu
} from 'lucide-react';

// --- SOUND SYNTHESIS ENGINE (Web Audio API - zero external files) ---
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private isMuted: boolean = true;

  constructor() {
    // Initialized on first user interaction
  }

  private init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Warm deep ambient chamber drone (42Hz)
    this.humOsc = this.ctx.createOscillator();
    this.humGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    this.humOsc.type = 'sine';
    this.humOsc.frequency.setValueAtTime(42, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.humOsc.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.masterGain);
    this.humOsc.start();
  }

  public toggleMute(): boolean {
    this.init();
    if (!this.ctx || !this.humGain) return true;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0 : 0.15;
    this.humGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
    
    if (!this.isMuted) {
      this.playChamberPressurize();
    }
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  // Soft pneumatic hiss + titanium mechanical relay click
  public playClick(freq = 840) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // High click (relay)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.04);

    // Subtle pneumatic hiss
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2400, t);
    noiseFilter.Q.setValueAtTime(2, t);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, t);
    noiseGain.gain.linearRampToValueAtTime(0, t + 0.06);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
  }

  public playChamberPressurize() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Harmonic swell
    const chord = [110, 165, 220, 330];
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, t + 0.8);
      
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.04 / (idx + 1), t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  }
}

// Global sound singleton for page
let globalSound: SoundEngine | null = null;
function getSound(): SoundEngine {
  if (typeof window === 'undefined') return {} as SoundEngine;
  if (!globalSound) {
    globalSound = new SoundEngine();
  }
  return globalSound;
}

// --- PRESSURE SPECIFICATIONS DATA ---
interface PressureTier {
  ata: number;
  label: string;
  name: string;
  tagline: string;
  description: string;
  arterialOxygen: number; // mmHg
  plasmaDissolvedO2: number; // vol%
  atpRate: string;
  stemCellMobilization: string;
  glowColor: string;
  streamSpeed: number;
  particleDensity: number;
}

const PRESSURE_TIERS: PressureTier[] = [
  {
    ata: 1.00,
    label: '1.00 ATA',
    name: 'BASELINE ATMOSPHERE',
    tagline: 'Standard sea-level barometric balance',
    description: 'Ambient atmospheric equilibrium. Hemoglobin operates at conventional binding affinity with baseline plasma diffusion.',
    arterialOxygen: 100,
    plasmaDissolvedO2: 0.3,
    atpRate: '1.0x',
    stemCellMobilization: 'Baseline',
    glowColor: '#38bdf8',
    streamSpeed: 0.8,
    particleDensity: 40,
  },
  {
    ata: 1.50,
    label: '1.50 ATA',
    name: 'BIOLOGICAL SYNCHRONY',
    tagline: 'Deep cognitive clarity & cellular oxygenation',
    description: 'Elevated hydrostatic gradient. Dissolves 10x oxygen volume directly into free lymph fluid, surpassing vascular stenosis barriers.',
    arterialOxygen: 840,
    plasmaDissolvedO2: 3.4,
    atpRate: '2.4x',
    stemCellMobilization: '+380%',
    glowColor: '#00f0ff',
    streamSpeed: 1.8,
    particleDensity: 80,
  },
  {
    ata: 2.00,
    label: '2.00 ATA',
    name: 'MAXIMUM HYPER-REGENERATION',
    tagline: 'Aerospace-grade mitochondrial saturation',
    description: 'Peak clinical-grade therapeutic pressurization. Henry’s Law saturation forces dissolved oxygen into deep bone marrow, microcapillaries, and damaged neural tissues.',
    arterialOxygen: 1420,
    plasmaDissolvedO2: 6.8,
    atpRate: '3.8x',
    stemCellMobilization: '+800%',
    glowColor: '#06b6d4',
    streamSpeed: 3.2,
    particleDensity: 140,
  },
];

export default function LandingGeminiHero() {
  const [activeTierIdx, setActiveTierIdx] = useState<number>(1); // Default to 1.50 ATA
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTier = PRESSURE_TIERS[activeTierIdx] ?? PRESSURE_TIERS[0]!;

  // Mouse tilt tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const nx = (clientX / innerWidth - 0.5) * 2;
    const ny = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x: nx, y: ny });
  }, []);

  // Audio mute toggle
  const toggleAudio = () => {
    const sound = getSound();
    const muted = sound.toggleMute();
    setIsAudioMuted(muted);
  };

  // Change pressure mode
  const handleTierChange = (idx: number) => {
    if (idx === activeTierIdx) return;
    const sound = getSound();
    sound.playClick(680 + idx * 240);
    sound.playChamberPressurize();
    setActiveTierIdx(idx);
  };

  // Background Interactive WebGL/Canvas Particle Fluid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Particle pool
    const count = 120;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      pulse: Math.random() * Math.PI,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let t = 0;

    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Radial dark atmosphere gradient
      const grad = ctx.createRadialGradient(
        width * 0.55 + mousePos.x * 40,
        height * 0.5 + mousePos.y * 30,
        50,
        width * 0.55,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      grad.addColorStop(0.4, 'rgba(8, 145, 178, 0.03)');
      grad.addColorStop(1, 'rgba(4, 6, 10, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Particle simulation
      const currentSpeed = activeTier.streamSpeed;
      const glow = activeTier.glowColor;

      ctx.fillStyle = glow;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 12;

      particles.forEach((p, i) => {
        p.pulse += 0.02;
        p.x += (p.speedX + mousePos.x * 0.4) * currentSpeed;
        p.y += (p.speedY + mousePos.y * 0.4) * currentSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect near neighbors
        for (let j = i + 1; j < particles.length; j += 6) {
          const p2 = particles[j];
          if (!p2) continue;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.strokeStyle = glow;
            ctx.globalAlpha = (1 - dist / 90) * 0.12 * (activeTier.ata / 1.5);
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, [activeTier, mousePos]);

  return (
    <div
      id="landing-gemini-page"
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[999999] overflow-y-auto overflow-x-hidden bg-[#040608] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black select-none"
      style={{
        backgroundColor: '#040608',
        color: '#f8fafc',
      }}
    >
      {/* GLOBAL ISOLATION STYLES TO BYPASS PREVIOUS CHROME COMPLETELY */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide existing site header and footer on this route */
        body header, body footer, body .skip-link, body #site-header, body #site-footer {
          display: none !important;
        }
        body {
          background-color: #040608 !important;
          overflow: hidden !important;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.4deg); }
        }
        .animate-vessel {
          animation: floatSlow 8s ease-in-out infinite;
        }
      `}} />

      {/* BACKGROUND WEBGL / CANVAS STREAM */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
      />

      {/* LUXURY PRECISION GRAIN & GRID LINES OVERLAY */}
      <div 
        className="pointer-events-none fixed inset-0 z-[1] opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      <div 
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* --- HERO VIEWPORT SHELL (100VH FULLSCREEN COCKPIT) --- */}
      <section className="relative z-10 flex min-h-screen w-full flex-col justify-between px-8 py-6 lg:px-14 lg:py-8">
        
        {/* --- TOP LUXURY TELEMETRY HUD NAVIGATION --- */}
        <header className="flex w-full items-center justify-between border-b border-white/10 pb-5 backdrop-blur-md">
          {/* Brand Mark with Barometric Status Indicator */}
          <div className="flex items-center gap-6">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-black tracking-[0.28em] text-white">
                HYLONO
              </span>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-semibold uppercase">
                // VESSEL ARCHITECTURE
              </span>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 font-mono text-[11px] text-cyan-300 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
              <span>PRESSURE SYSTEM: {activeTier.label} SYNCHRONIZED</span>
            </div>
          </div>

          {/* Center Navigation Pillars */}
          <nav className="hidden items-center gap-8 lg:flex">
            {['THE VESSEL', 'BAROMETRIC PHYSICS', 'CELLULAR PROTOCOLS', 'SANCTUARY SUITE'].map((item, idx) => (
              <button
                key={item}
                onClick={() => {
                  getSound().playClick(520 + idx * 80);
                }}
                className="group relative font-mono text-[11px] tracking-[0.2em] text-slate-400 transition-colors duration-300 hover:text-white"
              >
                <span>{item}</span>
                <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Status Controls & Audio Synth Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-wider transition-all duration-300 ${
                isAudioMuted
                  ? 'border-white/15 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white'
                  : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              }`}
            >
              {isAudioMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />}
              <span>{isAudioMuted ? 'AUDIO: MUTED' : 'ACOUSTIC SUITE: ON'}</span>
            </button>

            <div className="hidden items-center gap-2 border-l border-white/10 pl-4 font-mono text-[10px] text-slate-400 xl:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>EU MEDICAL CLASS IIb // HERMETIC MONOCOQUE</span>
            </div>
          </div>
        </header>

        {/* --- MAIN HERO STAGE (SPLIT INTERACTIVE COCKPIT) --- */}
        <div className="my-auto grid grid-cols-1 items-center gap-12 pt-6 pb-4 lg:grid-cols-12 lg:gap-8">
          
          {/* LEFT COLUMN: HERO MANIFESTO & REAL-TIME TELEMETRY (5 COLS) */}
          <div className="flex flex-col justify-center lg:col-span-5">
            
            {/* Classification Badge */}
            <div className="mb-4 inline-flex items-center gap-2.5">
              <span className="h-px w-6 bg-cyan-400" />
              <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400">
                PHYSIOLOGICAL TIME ARCHITECTURE
              </span>
            </div>

            {/* Giant Monolithic Headline */}
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl">
              REWRITE YOUR <br />
              <span className="relative inline-block bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                BIOLOGY AT 2.0
              </span> <br />
              ATMOSPHERES.
            </h1>

            {/* Subtitle with High-Net-Worth Philosophical Weight */}
            <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-slate-300 sm:text-lg">
              We design hermetically sealed hyperbaric sanctuaries that dissolve pure oxygen deep into free blood plasma — multiplying ATP mitochondrial synthesis, waking quiescent stem cells, and suspending physiological decay.
            </p>

            {/* Real-time Dynamic Telemetry Gauge Ribbon */}
            <div className="mt-7 grid grid-cols-3 gap-3 border-y border-white/10 py-4">
              <div>
                <span className="block font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                  Arterial pO₂
                </span>
                <span className="font-mono text-2xl font-bold tracking-tight text-white transition-all duration-500">
                  {activeTier.arterialOxygen}{' '}
                  <span className="text-xs font-normal text-cyan-400">mmHg</span>
                </span>
                <span className="block text-[11px] text-slate-400">
                  +{((activeTier.arterialOxygen / 100 - 1) * 100).toFixed(0)}% vs Ambient
                </span>
              </div>

              <div className="border-x border-white/10 px-3">
                <span className="block font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                  Dissolved Plasma O₂
                </span>
                <span className="font-mono text-2xl font-bold tracking-tight text-white transition-all duration-500">
                  {activeTier.plasmaDissolvedO2}{' '}
                  <span className="text-xs font-normal text-cyan-400">vol%</span>
                </span>
                <span className="block text-[11px] text-slate-400">
                  Henry’s Law Henry
                </span>
              </div>

              <div className="pl-1">
                <span className="block font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                  Stem-Cell Index
                </span>
                <span className="font-mono text-2xl font-bold tracking-tight text-cyan-300 transition-all duration-500">
                  {activeTier.stemCellMobilization}
                </span>
                <span className="block text-[11px] text-slate-400">
                  Mobilized Release
                </span>
              </div>
            </div>

            {/* Primary Action Suite */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  getSound().playClick(920);
                  getSound().playChamberPressurize();
                }}
                className="group relative flex items-center gap-3 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 font-mono text-xs font-bold tracking-[0.18em] text-black transition-all duration-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10">INITIATE PROTOCOL CONFIGURE</span>
                <ChevronRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              <button
                onClick={() => {
                  getSound().playClick(440);
                }}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-4 font-mono text-xs font-medium tracking-[0.16em] text-white transition-all duration-300 hover:border-cyan-400/60 hover:bg-white/10"
              >
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>VESSEL BLUEPRINT</span>
              </button>
            </div>

            {/* Secondary Micro-Certifications */}
            <div className="mt-6 flex items-center gap-5 text-slate-500 font-mono text-[10px] tracking-widest">
              <span>TITANIUM MONOCOQUE</span>
              <span>•</span>
              <span>SAPPHIRE CRYSTAL</span>
              <span>•</span>
              <span>99.98% SEAL INTEGRITY</span>
            </div>
          </div>

          {/* RIGHT COLUMN: MONOLITHIC VESSEL SHOWCASE (7 COLS) */}
          <div className="relative flex items-center justify-center lg:col-span-7">
            
            {/* Radial Atmospheric Glow Backdrop */}
            <div 
              className="absolute h-[420px] w-[540px] rounded-full blur-[110px] transition-all duration-700 pointer-events-none"
              style={{
                backgroundColor: activeTier.glowColor,
                opacity: 0.22 * (activeTier.ata / 1.2),
                transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
              }}
            />

            {/* Central Masterpiece Vessel Container with Parallax Perspective */}
            <div
              className="relative w-full max-w-[760px] rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.07] to-transparent p-2.5 shadow-2xl backdrop-blur-sm transition-transform duration-300 ease-out"
              style={{
                transform: `perspective(1200px) rotateX(${-mousePos.y * 4}deg) rotateY(${mousePos.x * 6}deg)`,
              }}
            >
              {/* Top Machined Bezel with Telemetry Readout */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-[10px] tracking-wider text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>VESSEL MODEL: HYLONO HYPERBARIC APEX-V</span>
                </div>
                <div>CHAMBER INTERIOR: 21.4°C // 48% RH</div>
                <div className="hidden sm:block text-cyan-400">
                  CURRENT ATA: {activeTier.ata.toFixed(2)}
                </div>
              </div>

              {/* Monolithic Image Frame */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black">
                {/* Generated 8K Masterpiece Vessel Image */}
                <img
                  src="/images/landing-gemini/vessel-hero.jpg"
                  alt="Hylono Hyperbaric Oxygen Therapy Monolithic Vessel"
                  className="h-full w-full object-cover object-center transition-all duration-700 hover:scale-105"
                  style={{
                    filter: `brightness(${0.95 + activeTier.ata * 0.05}) contrast(1.08)`,
                  }}
                />

                {/* Ambient Specular Glass Reflection Layer */}
                <div 
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/5 to-white/10 mix-blend-overlay"
                  style={{
                    transform: `translateX(${mousePos.x * 15}px) translateY(${mousePos.y * 15}px)`,
                  }}
                />

                {/* INTERACTIVE INSPECTION HOTSPOTS */}
                {/* Hotspot 1: Sapphire Cockpit Portal */}
                <div 
                  className="absolute left-[56%] top-[42%] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  onMouseEnter={() => {
                    setActiveHotspot('cockpit');
                    getSound().playClick(980);
                  }}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60"></span>
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400 bg-black/80 text-[10px] font-mono text-cyan-300">
                      01
                    </span>
                  </div>
                  {activeHotspot === 'cockpit' && (
                    <div className="absolute left-10 top-0 z-30 w-64 rounded-lg border border-cyan-500/40 bg-black/90 p-3 font-mono text-[11px] text-slate-200 shadow-2xl backdrop-blur-md">
                      <p className="font-bold text-cyan-300">SAPPHIRE CRYSTAL VIEWPORT</p>
                      <p className="mt-1 text-slate-400 font-sans text-xs">
                        Pressure-formed laminated dual-layer optical crystal. Withstands 3.0 ATA absolute structural load with zero distortion.
                      </p>
                    </div>
                  )}
                </div>

                {/* Hotspot 2: Titanium Monocoque Bulkhead */}
                <div 
                  className="absolute left-[24%] top-[46%] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  onMouseEnter={() => {
                    setActiveHotspot('monocoque');
                    getSound().playClick(720);
                  }}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-50"></span>
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-amber-400 bg-black/80 text-[10px] font-mono text-amber-300">
                      02
                    </span>
                  </div>
                  {activeHotspot === 'monocoque' && (
                    <div className="absolute left-10 top-0 z-30 w-64 rounded-lg border border-amber-500/40 bg-black/90 p-3 font-mono text-[11px] text-slate-200 shadow-2xl backdrop-blur-md">
                      <p className="font-bold text-amber-300">AEROSPACE TITANIUM REINFORCEMENT</p>
                      <p className="mt-1 text-slate-400 font-sans text-xs">
                        CNC milled Grade 5 titanium end-bells and carbon fiber monocoque skin with acoustic damping chambers.
                      </p>
                    </div>
                  )}
                </div>

                {/* Hotspot 3: Oxygen Vapor Flow Manifold */}
                <div 
                  className="absolute left-[70%] top-[78%] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  onMouseEnter={() => {
                    setActiveHotspot('manifold');
                    getSound().playClick(880);
                  }}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60"></span>
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400 bg-black/80 text-[10px] font-mono text-cyan-300">
                      03
                    </span>
                  </div>
                  {activeHotspot === 'manifold' && (
                    <div className="absolute right-10 top-0 z-30 w-64 rounded-lg border border-cyan-500/40 bg-black/90 p-3 font-mono text-[11px] text-slate-200 shadow-2xl backdrop-blur-md">
                      <p className="font-bold text-cyan-300">SILENT AIRLOCK GAS DISSOLUTION</p>
                      <p className="mt-1 text-slate-400 font-sans text-xs">
                        Ultrasonic 96.4% medical oxygen delivery combined with silent laminar air cycling and molecular filtration.
                      </p>
                    </div>
                  )}
                </div>

                {/* Dynamic Pressurization Status Overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-white/20 bg-black/70 px-3 py-1.5 font-mono text-[10px] text-white backdrop-blur-md">
                  <Activity className="h-3 w-3 text-cyan-400 animate-spin" />
                  <span>BAROMETRIC CHAMBER STATE: {activeTier.name}</span>
                </div>
              </div>

              {/* Bottom Inspection Ticker */}
              <div className="flex items-center justify-between px-3 pt-2 text-[10px] font-mono text-slate-400">
                <span>INTERACTIVE INSPECTION: HOVER PINS 01-03</span>
                <span className="text-cyan-400">CALIBRATED TO ISO 13485 STANDARDS</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM INTERACTIVE ATA PRESSURE REACTOR CONTROLLER --- */}
        <div className="relative mt-auto border-t border-white/10 pt-5">
          <div className="mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            
            {/* Left Barometric Status & Instructions */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-400">
                <Gauge className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="block font-mono text-[10px] tracking-widest text-cyan-400 uppercase">
                  TACTILE PRESSURE CONTROLLER
                </span>
                <span className="text-xs text-slate-300">
                  Select barometric threshold to simulate biological oxygen dissolution
                </span>
              </div>
            </div>

            {/* Center: 3 Pressure Tiers Selector Switches */}
            <div className="flex items-center gap-3">
              {PRESSURE_TIERS.map((tier, idx) => {
                const isActive = activeTierIdx === idx;
                return (
                  <button
                    key={tier.label}
                    onClick={() => handleTierChange(idx)}
                    className={`relative flex items-center gap-3 rounded-xl border px-5 py-3 transition-all duration-300 ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-105'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200'
                    }`}
                  >
                    {/* Visual Pressure Indicator Ring */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                        isActive
                          ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00f0ff]'
                          : 'border border-white/20 bg-black text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="text-left font-mono">
                      <span className={`block text-xs font-bold ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {tier.label}
                      </span>
                      <span className="block text-[10px] tracking-wider text-slate-400">
                        {tier.name.split(' ')[0]}
                      </span>
                    </div>

                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Active Mode Brief Summary */}
            <div className="hidden text-right lg:block">
              <span className="block font-mono text-[10px] tracking-wider text-cyan-400 uppercase">
                {activeTier.name}
              </span>
              <span className="block max-w-xs text-xs text-slate-400 truncate">
                {activeTier.tagline}
              </span>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}
