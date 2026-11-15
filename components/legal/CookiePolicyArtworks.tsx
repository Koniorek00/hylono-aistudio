import React from 'react';

/**
 * 3D Isometric Artworks & Terrazzo Mineral Orb for Cookie Policy sections
 * Author: Authored SVG vectors matching Hylono luxury high-tech aesthetic
 */

export function TerrazzoOrbArt({ className = "w-44 h-44" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Ground Contact Shadow Filter */}
        <filter id="orbShadowBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>
        <filter id="specularBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>

        {/* 3D Spherical Volume Shading */}
        <radialGradient
          id="sphereVolumetric"
          cx="34%"
          cy="28%"
          r="72%"
          fx="32%"
          fy="26%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#F8FAFC" />
          <stop offset="60%" stopColor="#E2E8F0" />
          <stop offset="85%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>

        {/* Outer Occlusion / Vignette for true spherical curve */}
        <radialGradient id="sphereOcclusion" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#0F172A" stopOpacity="0" />
          <stop offset="92%" stopColor="#0F172A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.4" />
        </radialGradient>

        {/* Sphere Boundary Clip */}
        <clipPath id="sphereClip">
          <circle cx="100" cy="94" r="74" />
        </clipPath>
      </defs>

      {/* 1. Ground Contact Shadow (Soft diffused ellipse) */}
      <ellipse
        cx="100"
        cy="176"
        rx="64"
        ry="15"
        fill="#0F172A"
        fillOpacity="0.18"
        filter="url(#orbShadowBlur)"
      />
      <ellipse
        cx="100"
        cy="174"
        rx="40"
        ry="9"
        fill="#0F172A"
        fillOpacity="0.22"
        filter="url(#orbShadowBlur)"
      />

      {/* 2. Base 3D Sphere Surface */}
      <circle cx="100" cy="94" r="74" fill="url(#sphereVolumetric)" />

      {/* 3. Embedded Terrazzo Mineral Chips & Flecks (Clipped to Sphere) */}
      <g clipPath="url(#sphereClip)">
        {/* Large Mineral Aggregates (Granite / Basalt / Quartz) */}
        <path d="M72 45 Q78 40 84 46 Q88 52 82 58 Q75 60 70 54 Z" fill="#0F172A" fillOpacity="0.88" />
        <path d="M125 60 Q135 55 140 65 Q142 75 132 80 Q122 78 120 68 Z" fill="#1E293B" fillOpacity="0.85" />
        <path d="M52 85 Q62 80 66 90 Q68 100 58 104 Q48 100 48 90 Z" fill="#0F172A" fillOpacity="0.9" />
        <path d="M95 105 Q105 98 112 108 Q115 118 102 122 Q92 118 90 110 Z" fill="#1E293B" fillOpacity="0.92" />
        <path d="M138 110 Q148 106 150 118 Q148 126 138 128 Q130 124 132 114 Z" fill="#0F172A" fillOpacity="0.8" />
        <path d="M68 130 Q78 125 82 136 Q80 144 72 146 Q64 142 65 133 Z" fill="#334155" fillOpacity="0.82" />

        {/* Medium Slate & Stone Fragments */}
        <polygon points="105,42 114,48 108,56 99,50" fill="#475569" fillOpacity="0.75" />
        <polygon points="45,62 52,66 48,74 40,70" fill="#334155" fillOpacity="0.8" />
        <polygon points="85,72 96,76 92,86 80,82" fill="#0F172A" fillOpacity="0.85" />
        <polygon points="146,85 154,92 148,100 140,94" fill="#334155" fillOpacity="0.7" />
        <polygon points="112,132 122,138 118,146 108,142" fill="#1E293B" fillOpacity="0.85" />
        <polygon points="56,112 65,116 60,125 52,120" fill="#475569" fillOpacity="0.75" />

        {/* Subtle Bio-Cyan & Mineral Crystal Accents */}
        <polygon points="78,92 86,95 82,102 75,99" fill="#0891B2" fillOpacity="0.8" />
        <polygon points="128,95 134,98 131,105 125,102" fill="#06B6D4" fillOpacity="0.75" />
        <circle cx="102" cy="68" r="3" fill="#0891B2" fillOpacity="0.7" />
        <circle cx="62" cy="74" r="2.5" fill="#06B6D4" fillOpacity="0.65" />
        <circle cx="118" cy="118" r="3" fill="#0891B2" fillOpacity="0.7" />

        {/* Warm Bronze / Earth Mineral Flecks */}
        <polygon points="90,58 96,62 92,68 86,65" fill="#78350F" fillOpacity="0.65" />
        <polygon points="135,74 142,78 138,84 132,80" fill="#9A3412" fillOpacity="0.6" />
        <circle cx="76" cy="122" r="2.5" fill="#78350F" fillOpacity="0.55" />

        {/* Micro Granite Pepper / Fleck Field */}
        <circle cx="64" cy="52" r="1.8" fill="#0F172A" fillOpacity="0.6" />
        <circle cx="92" cy="38" r="1.5" fill="#1E293B" fillOpacity="0.5" />
        <circle cx="118" cy="46" r="2" fill="#0F172A" fillOpacity="0.6" />
        <circle cx="132" cy="52" r="1.5" fill="#334155" fillOpacity="0.5" />
        <circle cx="48" cy="78" r="2.2" fill="#0F172A" fillOpacity="0.65" />
        <circle cx="70" cy="76" r="1.5" fill="#1E293B" fillOpacity="0.5" />
        <circle cx="110" cy="84" r="2" fill="#0F172A" fillOpacity="0.6" />
        <circle cx="152" cy="76" r="1.8" fill="#334155" fillOpacity="0.5" />
        <circle cx="58" cy="98" r="1.6" fill="#0F172A" fillOpacity="0.6" />
        <circle cx="86" cy="116" r="2.2" fill="#1E293B" fillOpacity="0.65" />
        <circle cx="124" cy="126" r="1.8" fill="#0F172A" fillOpacity="0.5" />
        <circle cx="144" cy="132" r="2" fill="#334155" fillOpacity="0.6" />
        <circle cx="82" cy="150" r="1.8" fill="#0F172A" fillOpacity="0.5" />
        <circle cx="98" cy="154" r="2.2" fill="#1E293B" fillOpacity="0.6" />

        {/* Ambient Occlusion Ring (Gives 3D depth to flecks) */}
        <circle cx="100" cy="94" r="74" fill="url(#sphereOcclusion)" />

        {/* Bottom Ambient Bounce Light from White Terrace Floor */}
        <ellipse
          cx="100"
          cy="158"
          rx="52"
          ry="16"
          fill="#FFFFFF"
          fillOpacity="0.32"
          filter="url(#specularBlur)"
        />

        {/* Polished Specular Highlight (Upper Left Glass Luster) */}
        <ellipse
          cx="68"
          cy="60"
          rx="24"
          ry="16"
          transform="rotate(-25 68 60)"
          fill="#FFFFFF"
          fillOpacity="0.75"
          filter="url(#specularBlur)"
        />
        <circle
          cx="62"
          cy="54"
          r="8"
          fill="#FFFFFF"
          fillOpacity="0.9"
          filter="url(#specularBlur)"
        />
      </g>

      {/* Crisp 1px Polished Contour Hairline */}
      <circle
        cx="100"
        cy="94"
        r="74"
        stroke="#E2E8F0"
        strokeWidth="1"
        strokeOpacity="0.8"
      />
    </svg>
  );
}

export function EssentialStorageArt({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="glassTop" x1="80" y1="25" x2="80" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" stopOpacity="0.9" />
          <stop stopColor="#E2E8F0" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="glassLeft" x1="25" y1="75" x2="80" y2="135" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CBD5E1" stopOpacity="0.5" />
          <stop stopColor="#94A3B8" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="glassRight" x1="135" y1="75" x2="80" y2="135" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2E8F0" stopOpacity="0.7" />
          <stop stopColor="#CBD5E1" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="cyanCore" x1="60" y1="65" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06B6D4" stopOpacity="0.8" />
          <stop stopColor="#0891B2" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="80" cy="138" rx="50" ry="14" fill="#0F172A" fillOpacity="0.06" />

      {/* Base Box Outline & Inner Core */}
      <path d="M80 35 L130 65 L80 95 L30 65 Z" fill="url(#glassTop)" stroke="#94A3B8" strokeWidth="1.5" />
      <path d="M30 65 L80 95 L80 135 L30 105 Z" fill="url(#glassLeft)" stroke="#94A3B8" strokeWidth="1.5" />
      <path d="M130 65 L80 95 L80 135 L130 105 Z" fill="url(#glassRight)" stroke="#94A3B8" strokeWidth="1.5" />

      {/* Inner Glowing Storage Vault Core */}
      <path d="M80 55 L110 73 L80 91 L50 73 Z" fill="url(#cyanCore)" fillOpacity="0.3" stroke="#06B6D4" strokeWidth="1.5" />
      <path d="M50 73 L80 91 L80 115 L50 97 Z" fill="#0891B2" fillOpacity="0.25" stroke="#0891B2" strokeWidth="1.2" />
      <path d="M110 73 L80 91 L80 115 L110 97 Z" fill="#06B6D4" fillOpacity="0.35" stroke="#06B6D4" strokeWidth="1.2" />

      {/* Futuristic Storage Lines */}
      <line x1="80" y1="45" x2="80" y2="55" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="42" r="2.5" fill="#06B6D4" />
      <line x1="30" y1="85" x2="80" y2="115" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="130" y1="85" x2="80" y2="115" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

export function OptionalAnalyticsArt({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dialRing" x1="30" y1="30" x2="130" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="cyanArc" x1="50" y1="50" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06B6D4" />
          <stop stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="80" cy="138" rx="45" ry="12" fill="#0F172A" fillOpacity="0.05" />

      {/* Outer Dial Platform */}
      <circle cx="80" cy="80" r="52" fill="url(#dialRing)" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="44" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

      {/* Concentric Telemetry Arcs */}
      <circle cx="80" cy="80" r="32" stroke="#E2E8F0" strokeWidth="4" />
      <path
        d="M80 48 A32 32 0 0 1 112 80"
        stroke="url(#cyanArc)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Inner Target Center */}
      <circle cx="80" cy="80" r="18" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="7" fill="#0F172A" />
      <circle cx="80" cy="80" r="3" fill="#06B6D4" />

      {/* Micro Metrics & Ticks */}
      <line x1="80" y1="24" x2="80" y2="30" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <line x1="136" y1="80" x2="130" y2="80" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <line x1="80" y1="136" x2="80" y2="130" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="80" x2="30" y2="80" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

      {/* Indicator needle/node */}
      <circle cx="106" cy="62" r="4.5" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

export function MarketingPreferenceArt({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="switchTrack" x1="40" y1="60" x2="120" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1F5F9" />
          <stop stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="knobGradient" x1="75" y1="65" x2="115" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop stopColor="#F8FAFC" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="80" cy="138" rx="48" ry="12" fill="#0F172A" fillOpacity="0.05" />

      {/* Isometric Base Plate */}
      <rect x="25" y="45" width="110" height="70" rx="20" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Switch Track Groove */}
      <rect x="42" y="62" width="76" height="36" rx="18" fill="url(#switchTrack)" stroke="#94A3B8" strokeWidth="1.2" />

      {/* Active State Glow Indicator on Track */}
      <circle cx="58" cy="80" r="5" fill="#94A3B8" fillOpacity="0.5" />
      <circle cx="102" cy="80" r="5" fill="#06B6D4" fillOpacity="0.5" />

      {/* Tactile 3D Slider Knob */}
      <ellipse cx="100" cy="80" rx="16" ry="16" fill="url(#knobGradient)" stroke="#94A3B8" strokeWidth="1.5" />
      <ellipse cx="100" cy="80" rx="9" ry="9" fill="#F1F5F9" stroke="#06B6D4" strokeWidth="2" />
      <circle cx="100" cy="80" r="3.5" fill="#06B6D4" />

      {/* Precision Lines */}
      <line x1="38" y1="52" x2="48" y2="52" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ManageCookiesArt({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="windowBg" x1="30" y1="40" x2="130" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="cookieBg" x1="65" y1="65" x2="105" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1F5F9" />
          <stop stopColor="#E2E8F0" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="80" cy="138" rx="46" ry="12" fill="#0F172A" fillOpacity="0.05" />

      {/* Browser Window Frame */}
      <rect x="28" y="42" width="104" height="76" rx="14" fill="url(#windowBg)" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Window Title Bar */}
      <path d="M28 56 L132 56" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="40" cy="49" r="2.5" fill="#94A3B8" />
      <circle cx="48" cy="49" r="2.5" fill="#CBD5E1" />
      <circle cx="56" cy="49" r="2.5" fill="#E2E8F0" />

      {/* Window Controls / Cookie Glyph */}
      <circle cx="80" cy="85" r="22" fill="url(#cookieBg)" stroke="#94A3B8" strokeWidth="1.5" />

      {/* Cookie Chip Dots / Chunks */}
      <circle cx="73" cy="79" r="3" fill="#0F172A" />
      <circle cx="86" cy="81" r="2.5" fill="#06B6D4" />
      <circle cx="75" cy="91" r="2.5" fill="#06B6D4" />
      <circle cx="86" cy="92" r="3" fill="#0F172A" />

      {/* Subtle Settings Gear Outline */}
      <circle cx="80" cy="85" r="26" stroke="#06B6D4" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
    </svg>
  );
}
