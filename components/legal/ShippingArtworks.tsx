import React from 'react';

/**
 * High-precision vector artworks and graphics for the Shipping Policy page.
 * Reinterprets the pale dawn logistics aesthetic, Europe coverage route lines,
 * itinerary timeline, and pre-checkout verification cards.
 */

export function EuropeMapHeroArt({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Stylized Europe Landmass Polygons / Contours in Pale Blue/Slate */}
      <g opacity="0.65" filter="url(#mapShadow)">
        {/* Scandinavia */}
        <path
          d="M260 40 C270 30 290 35 295 50 C300 70 290 100 280 120 C275 130 265 140 255 135 C245 130 240 100 250 70 Z"
          fill="#E2EBF2"
          stroke="#94A3B8"
          strokeWidth="1.2"
        />
        {/* UK & Ireland */}
        <path
          d="M175 110 C185 100 195 105 190 125 C185 140 175 155 165 150 C160 140 165 120 175 110 Z"
          fill="#EDF3F8"
          stroke="#CBD5E1"
          strokeWidth="1"
        />
        <path
          d="M150 125 C155 120 160 125 158 135 C155 145 148 145 145 140 C143 135 145 128 150 125 Z"
          fill="#EDF3F8"
          stroke="#CBD5E1"
          strokeWidth="1"
        />
        {/* Western & Central Europe */}
        <path
          d="M190 160 C210 150 250 150 280 160 C320 170 360 165 380 190 C390 220 370 250 330 250 C290 250 260 270 230 260 C210 250 190 230 180 200 C175 180 180 165 190 160 Z"
          fill="#E2EBF2"
          stroke="#94A3B8"
          strokeWidth="1.2"
        />
        {/* Iberian Peninsula */}
        <path
          d="M140 230 C170 230 185 245 180 275 C175 300 150 310 130 300 C115 285 120 250 140 230 Z"
          fill="#E2EBF2"
          stroke="#94A3B8"
          strokeWidth="1.2"
        />
        {/* Italian Peninsula */}
        <path
          d="M260 240 C270 240 280 255 290 280 C295 295 305 310 300 315 C290 320 280 300 275 285 C265 270 255 250 260 240 Z"
          fill="#E2EBF2"
          stroke="#94A3B8"
          strokeWidth="1.2"
        />
      </g>

      {/* Logistics Route Lines connecting EU Hubs */}
      <g stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75">
        <line x1="225" y1="180" x2="270" y2="185" /> {/* Paris -> Frankfurt/Berlin */}
        <line x1="270" y1="185" x2="330" y2="180" /> {/* Berlin -> Warsaw */}
        <line x1="225" y1="180" x2="215" y2="165" /> {/* Paris -> Brussels */}
        <line x1="270" y1="185" x2="280" y2="225" /> {/* Frankfurt -> Vienna/Alps */}
        <line x1="280" y1="225" x2="275" y2="275" /> {/* Vienna -> Milan/Rome */}
        <line x1="225" y1="180" x2="160" y2="260" /> {/* Paris -> Madrid */}
        <line x1="270" y1="185" x2="270" y2="120" /> {/* Central EU -> Copenhagen/Stockholm */}
      </g>

      {/* Active EU Hub Nodes */}
      <g>
        {/* Brussels */}
        <circle cx="215" cy="165" r="7" fill="url(#nodeGlow)" />
        <circle cx="215" cy="165" r="3" fill="#0284C7" />
        {/* Paris */}
        <circle cx="225" cy="180" r="7" fill="url(#nodeGlow)" />
        <circle cx="225" cy="180" r="3" fill="#0284C7" />
        {/* Berlin / Frankfurt */}
        <circle cx="270" cy="185" r="7" fill="url(#nodeGlow)" />
        <circle cx="270" cy="185" r="3.5" fill="#0284C7" />
        {/* Warsaw */}
        <circle cx="330" cy="180" r="7" fill="url(#nodeGlow)" />
        <circle cx="330" cy="180" r="3.5" fill="#0284C7" />
        {/* Vienna */}
        <circle cx="280" cy="225" r="6" fill="url(#nodeGlow)" />
        <circle cx="280" cy="225" r="3" fill="#0284C7" />
        {/* Rome */}
        <circle cx="275" cy="275" r="6" fill="url(#nodeGlow)" />
        <circle cx="275" cy="275" r="3" fill="#0284C7" />
        {/* Madrid */}
        <circle cx="160" cy="260" r="6" fill="url(#nodeGlow)" />
        <circle cx="160" cy="260" r="3" fill="#0284C7" />
        {/* Stockholm */}
        <circle cx="270" cy="120" r="6" fill="url(#nodeGlow)" />
        <circle cx="270" cy="120" r="3" fill="#0284C7" />
      </g>

      {/* Expressive pointer arrow indicating EU hub network */}
      <g transform="translate(255, 100)" opacity="0.85">
        <path
          d="M0 0 Q15 25 5 45"
          fill="none"
          stroke="#0284C7"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M0 38 L5 45 L12 42"
          fill="none"
          stroke="#0284C7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function EuropeMapSectionArt({ className = 'w-full h-auto' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-[#F4F8FA] via-[#EDF3F7] to-[#E5EDF4] p-5 ${className}`}>
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.7),transparent_70%)]" />

      <svg
        viewBox="0 0 380 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-auto"
        aria-hidden="true"
      >
        <defs>
          <filter id="secMapShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Scandinavia */}
        <path
          d="M190 20 C200 12 215 15 220 28 C225 45 218 68 210 82 C205 90 198 96 190 92 C182 88 178 68 185 45 Z"
          fill="#FFFFFF"
          stroke="#94A3B8"
          strokeWidth="1"
          filter="url(#secMapShadow)"
        />
        {/* UK */}
        <path
          d="M125 75 C132 68 140 72 136 86 C132 98 124 108 116 104 C112 96 116 82 125 75 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="0.8"
        />
        {/* Western/Central EU */}
        <path
          d="M135 110 C150 102 180 102 205 110 C235 118 265 114 280 132 C288 154 272 176 242 176 C212 176 190 190 168 182 C152 175 138 160 130 138 C126 124 128 114 135 110 Z"
          fill="#FFFFFF"
          stroke="#94A3B8"
          strokeWidth="1.2"
          filter="url(#secMapShadow)"
        />
        {/* Spain & Portugal */}
        <path
          d="M95 160 C118 160 130 172 126 194 C122 212 102 220 86 212 C74 200 78 174 95 160 Z"
          fill="#FFFFFF"
          stroke="#94A3B8"
          strokeWidth="1"
          filter="url(#secMapShadow)"
        />
        {/* Italy */}
        <path
          d="M190 170 C198 170 205 182 212 200 C216 212 224 224 220 228 C212 232 204 216 200 204 C192 192 185 178 190 170 Z"
          fill="#FFFFFF"
          stroke="#94A3B8"
          strokeWidth="1"
          filter="url(#secMapShadow)"
        />

        {/* Route Lines */}
        <g stroke="#0284C7" strokeWidth="1.2" strokeDasharray="3 3">
          <line x1="160" y1="125" x2="195" y2="128" />
          <line x1="195" y1="128" x2="245" y2="125" />
          <line x1="160" y1="125" x2="110" y2="182" />
          <line x1="195" y1="128" x2="202" y2="158" />
          <line x1="202" y1="158" x2="200" y2="198" />
          <line x1="195" y1="128" x2="195" y2="78" />
        </g>

        {/* Nodes */}
        <circle cx="160" cy="125" r="3" fill="#0284C7" />
        <circle cx="195" cy="128" r="3.5" fill="#0284C7" />
        <circle cx="245" cy="125" r="3.5" fill="#0284C7" />
        <circle cx="110" cy="182" r="3" fill="#0284C7" />
        <circle cx="202" cy="158" r="3" fill="#0284C7" />
        <circle cx="200" cy="198" r="3" fill="#0284C7" />
        <circle cx="195" cy="78" r="3" fill="#0284C7" />

        {/* Route indicator arrow */}
        <g transform="translate(240, 70)" opacity="0.75">
          <path
            d="M0 0 Q10 20 2 35"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M0 30 L2 35 L7 33"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

export function ChecklistClipboardCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-[#FAF8F5] to-[#F1EFEA] p-6 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {/* Top Clipboard Clip Representation */}
      <div className="mx-auto mb-4 flex h-4 w-24 items-center justify-center rounded-t-md border-x border-t border-slate-400 bg-slate-700 shadow-xs">
        <div className="h-1.5 w-12 rounded-full bg-slate-400/80" />
      </div>

      {/* Clipboard Sheet */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="h-2.5 w-28 rounded bg-slate-300" />
          <div className="h-2 w-10 rounded bg-cyan-100" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-2xs">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="space-y-1">
              <div className="h-2 w-44 rounded bg-slate-300" />
              <div className="h-1.5 w-28 rounded bg-slate-200" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-2xs">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="space-y-1">
              <div className="h-2 w-40 rounded bg-slate-300" />
              <div className="h-1.5 w-24 rounded bg-slate-200" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-2xs">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="space-y-1">
              <div className="h-2 w-48 rounded bg-slate-300" />
              <div className="h-1.5 w-32 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
