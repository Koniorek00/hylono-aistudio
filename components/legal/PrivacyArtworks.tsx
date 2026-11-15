import React from 'react';

/**
 * HeroGlassShieldArt
 * Authored luxury 3D translucent vector glass shield with glowing lock glyph.
 * Designed with layered frosted gradients, bevel highlights, and ambient glow.
 */
export function HeroGlassShieldArt({ className = 'w-64 h-72' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-hidden="true">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-cyan-400/15 blur-3xl rounded-full scale-75 transform -translate-y-2 pointer-events-none" />
      <div className="absolute inset-0 bg-amber-200/10 blur-2xl rounded-full scale-50 transform translate-x-4 pointer-events-none" />

      <svg
        viewBox="0 0 280 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Glass shield gradient */}
          <linearGradient id="shieldGlass" x1="40" y1="20" x2="240" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#080e1a" stopOpacity="0.45" />
          </linearGradient>

          {/* Border bevel gradient */}
          <linearGradient id="shieldBorder" x1="50" y1="10" x2="230" y2="310" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>

          {/* Padlock metal gradient */}
          <linearGradient id="lockBodyGrad" x1="110" y1="140" x2="170" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Shackle metal gradient */}
          <linearGradient id="shackleGrad" x1="115" y1="80" x2="165" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Keyhole glow */}
          <radialGradient id="keyholeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>

          {/* Glass blur filter */}
          <filter id="glassReflect" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield Path */}
        <path
          d="M140 22 C205 22 238 48 248 102 C254 185 200 252 140 298 C80 252 26 185 32 102 C42 48 75 22 140 22 Z"
          fill="url(#shieldGlass)"
          stroke="url(#shieldBorder)"
          strokeWidth="2.5"
          className="backdrop-blur-md"
        />

        {/* Inner Glass Contour / Prismatic Refraction */}
        <path
          d="M140 36 C195 36 224 58 232 106 C237 176 190 236 140 278 C90 236 43 176 48 106 C56 58 85 36 140 36 Z"
          stroke="white"
          strokeOpacity="0.22"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Diagonal Light Glare Reflection */}
        <path
          d="M65 55 Q 110 38 140 38 Q 170 38 215 55 C 190 145 150 200 140 255 C 130 200 90 145 65 55 Z"
          fill="white"
          fillOpacity="0.04"
        />

        {/* Upper Left Glass Sheen Highlight */}
        <path
          d="M75 48 C 110 32 140 32 140 32 C 140 32 80 80 68 120 C 58 75 65 55 75 48 Z"
          fill="white"
          fillOpacity="0.18"
          filter="url(#glassReflect)"
        />

        {/* PADLOCK GLYPH */}
        <g transform="translate(0, 5)">
          {/* Shackle */}
          <path
            d="M116 146 V118 C116 104.745 126.745 94 140 94 C153.255 94 164 104.745 164 118 V146"
            stroke="url(#shackleGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />

          {/* Padlock Body Drop Shadow */}
          <rect
            x="104"
            y="142"
            width="72"
            height="58"
            rx="12"
            fill="#050810"
            fillOpacity="0.6"
            filter="url(#glassReflect)"
          />

          {/* Padlock Body */}
          <rect
            x="106"
            y="140"
            width="68"
            height="56"
            rx="10"
            fill="url(#lockBodyGrad)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Padlock Keyhole */}
          <circle cx="140" cy="163" r="5" fill="#0f172a" />
          <path d="M138 165 L142 165 L144 177 L136 177 Z" fill="#0f172a" />
          <circle cx="140" cy="163" r="7" fill="url(#keyholeGlow)" pointerEvents="none" />
        </g>
      </svg>
    </div>
  );
}

/**
 * LaptopIntakeArt
 * Authored vector laptop intake form graphic for "What Hylono Collects".
 */
export function LaptopIntakeArt({ className = 'w-full max-w-md' }: { className?: string }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-900/5 p-4 sm:p-6 border border-slate-200/80 shadow-sm ${className}`} aria-hidden="true">
      {/* Background ambient lighting */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-100/50 rounded-full blur-2xl pointer-events-none" />

      {/* Laptop Chassis */}
      <div className="relative mx-auto w-full max-w-sm rounded-t-xl bg-slate-800 p-2 pt-3 shadow-lg border border-slate-700/60">
        {/* Webcam */}
        <div className="mx-auto mb-2 h-1.5 w-1.5 rounded-full bg-slate-600 border border-slate-500/50" />

        {/* Screen */}
        <div className="relative rounded-lg bg-[#0d131f] p-4 text-left border border-slate-700/40 overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Form Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400/80" />
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
            </div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-200/90 font-medium">
              hylono.com/contact
            </span>
          </div>

          {/* Simulated Form Fields */}
          <div className="relative z-10 space-y-2">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Name</div>
              <div className="h-6 rounded bg-white/5 border border-white/10 px-2 flex items-center text-[10px] text-slate-300">
                Elena Rostova
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Email</div>
              <div className="h-6 rounded bg-white/5 border border-white/10 px-2 flex items-center text-[10px] text-slate-300">
                elena@sanctuary-zurich.ch
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Subject</div>
                <div className="h-6 rounded bg-white/5 border border-white/10 px-2 flex items-center text-[10px] text-slate-300">
                  Clinic Protocol
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Inquiry Type</div>
                <div className="h-6 rounded bg-white/5 border border-white/10 px-2 flex items-center text-[10px] text-cyan-300">
                  Rental & Setup
                </div>
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Message</div>
              <div className="h-10 rounded bg-white/5 border border-white/10 p-1.5 text-[9px] text-slate-300 leading-tight">
                Requesting verification of clinical chamber intake specs for our facility in Zurich...
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[8px] text-emerald-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                TLS 1.3 Verified Encrypted
              </div>
              <div className="h-5 px-3 rounded bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-medium text-cyan-200 flex items-center">
                Submit Request
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Laptop Base Stand */}
      <div className="relative mx-auto h-2 w-full max-w-[26rem] rounded-b-lg bg-slate-700 border-t border-slate-600/70 shadow-md">
        <div className="mx-auto h-1 w-12 rounded-b bg-slate-500" />
      </div>
    </div>
  );
}

/**
 * Provider Logos (Official clean SVG vectors)
 */
export function DrizzleNeonLogo({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M12 4 L19 16 L14 16 L17 24 L8 12 L13 12 Z" fill="#00e5ff" />
      <text x="24" y="19" fill="currentColor" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
        Drizzle + Neon
      </text>
    </svg>
  );
}

export function ResendLogo({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="2" y="6" width="16" height="16" rx="4" fill="currentColor" fillOpacity="0.15" />
      <path d="M6 10 L10 14 L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5" y="9" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <text x="24" y="19" fill="currentColor" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
        Resend
      </text>
    </svg>
  );
}

export function N8nLogo({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="6" cy="14" r="3.5" fill="#ea580c" />
      <circle cx="16" cy="8" r="3" fill="#ea580c" />
      <circle cx="16" cy="20" r="3" fill="#ea580c" />
      <path d="M6 14 L16 8 M6 14 L16 20" stroke="#ea580c" strokeWidth="1.5" />
      <text x="24" y="19" fill="currentColor" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
        n8n
      </text>
    </svg>
  );
}

export function StripeLogo({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 75 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="18" rx="5" fill="#6366f1" fillOpacity="0.15" />
      <path
        d="M13.5 10.5 C11.5 10.5 10.2 11.4 10.2 12.8 C10.2 15 14.5 14.5 14.5 16.2 C14.5 17 13.5 17.5 12.2 17.5 C10.8 17.5 9.5 16.8 9.5 16.8 L9 18.8 C9 18.8 10.5 19.5 12.2 19.5 C14.5 19.5 16.8 18.4 16.8 16 C16.8 13.5 12.5 14 12.5 12.5 C12.5 11.8 13.2 11.4 14.2 11.4 C15.4 11.4 16.4 12 16.4 12 L17 10.2 C17 10.2 15.5 10.5 13.5 10.5 Z"
        fill="#6366f1"
      />
      <text x="26" y="19" fill="currentColor" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
        Stripe
      </text>
    </svg>
  );
}

export function PostHogLogo({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 85 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M4 19 L4 13 M8 19 L8 9 M12 19 L12 15 M16 19 L16 7" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
      <text x="24" y="19" fill="currentColor" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
        PostHog
      </text>
    </svg>
  );
}
