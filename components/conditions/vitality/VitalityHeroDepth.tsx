'use client';

/**
 * VitalityHeroDepth — the hero's scroll-depth cue and ambient isobar field.
 *
 * WHAT THIS IS, AND WHY IT IS A CLIENT ISLAND
 *
 * Two motion ideas, both pure decoration over server-rendered text:
 *
 *  1. A read-progress rail. The hero is the top of the document, so the rail
 *     reports how much of the page the reader has scrolled past it. It is the
 *     one honest "depth" cue this surface needs: it never lies about progress
 *     because it is measured, not simulated.
 *  2. A slow pressure bloom on the ambient field, so the hero reads as a lit
 *     chamber rather than a flat card.
 *
 * Neither wraps any text. The headline, subhead, and calls to action are all in
 * the server-rendered markup, so hydration adds motion without touching LCP.
 *
 * PERFORMANCE AND TEARDOWN CONTRACT
 *
 * One passive scroll listener and one rAF loop, both created inside a single
 * effect and both removed on unmount. The rAF only ever writes a CSS custom
 * property and a transform on `will-change: transform` elements, so no frame
 * triggers layout or paint. `prefers-reduced-motion: reduce` never starts the
 * loop at all: the rail renders in its complete state and the field is static.
 */

import { useEffect, useRef } from 'react';

export function VitalityHeroDepth() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    if (reduceMotionQuery?.matches) {
      return;
    }

    const rail = railRef.current;
    const field = fieldRef.current;

    if (!rail && !field) {
      return;
    }

    let frame = 0;
    let latestScroll = window.scrollY;
    let progress = 0;
    let bloom = 0;

    const measure = () => {
      frame = 0;
      const scrollRange = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      progress = Math.min(1, Math.max(0, latestScroll / scrollRange));
      // Bloom is a 0..1 triangle wave over roughly four viewport heights, so the
      // field breathes once and holds rather than looping forever on screen.
      bloom =
        0.5 -
        0.5 * Math.cos((Math.min(1, latestScroll / 2400) * Math.PI * 2) / 2);

      if (rail) {
        rail.style.setProperty('--vitality-progress', progress.toFixed(4));
      }

      if (field) {
        field.style.setProperty('--vitality-bloom', bloom.toFixed(4));
      }
    };

    const onScroll = () => {
      latestScroll = window.scrollY;

      if (frame === 0) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    const onMotionPreferenceChange = () => {
      if (reduceMotionQuery?.matches) {
        latestScroll = window.scrollY;
        progress = 0;
        bloom = 0;

        if (rail) {
          rail.style.setProperty('--vitality-progress', '0');
        }

        if (field) {
          field.style.setProperty('--vitality-bloom', '0');
        }
      }
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    reduceMotionQuery?.addEventListener('change', onMotionPreferenceChange);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener('scroll', onScroll);
      reduceMotionQuery?.removeEventListener(
        'change',
        onMotionPreferenceChange
      );
    };
  }, []);

  return (
    <>
      {/* Ambient field: two low-opacity modality blooms and a hairline isobar grid. */}
      <div
        ref={fieldRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
      >
        <div
          className="absolute -inset-[18%] opacity-90 will-change-transform motion-reduce:will-change-auto"
          style={{
            transform:
              'translate3d(0,0,0) scale(calc(1 + var(--vitality-bloom, 0) * 0.06))',
            background:
              'radial-gradient(58% 46% at 16% 8%, color-mix(in srgb, var(--accent-oxygen) 62%, transparent), transparent 68%), radial-gradient(50% 54% at 92% 92%, color-mix(in srgb, var(--accent-hydrogen) 54%, transparent), transparent 70%), radial-gradient(38% 30% at 74% 6%, color-mix(in srgb, var(--accent-signal) 26%, transparent), transparent 72%)',
            transition: 'transform 600ms var(--ease-ui-standard, ease)',
          }}
        />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, color-mix(in srgb, var(--color-on-ink) 11%, transparent) 0 1px, transparent 1px 72px), repeating-linear-gradient(to bottom, color-mix(in srgb, var(--color-on-ink) 8%, transparent) 0 1px, transparent 1px 72px)',
            maskImage:
              'radial-gradient(130% 96% at 34% 0%, #000 0%, transparent 82%)',
          }}
        />
        {/* A single pressure contour, drawn rather than animated. */}
        <svg
          className="absolute inset-x-0 bottom-0 h-32 w-full opacity-30"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            d="M0 150 C 260 118, 420 168, 640 128 C 840 92, 980 150, 1200 104"
            fill="none"
            stroke="var(--accent-oxygen)"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M0 132 C 280 100, 430 150, 660 110 C 860 76, 990 132, 1200 86"
            fill="none"
            stroke="var(--accent-hydrogen)"
            strokeWidth="1"
            strokeOpacity="0.7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Read-progress rail. Decorative: the hero copy already states the plan. */}
      <div
        ref={railRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] overflow-hidden rounded-b-[2rem]"
        style={{
          background:
            'color-mix(in srgb, var(--color-on-ink) 10%, transparent)',
        }}
      >
        <div
          className="h-full origin-left"
          style={{
            transform: 'scaleX(var(--vitality-progress, 0))',
            background:
              'linear-gradient(90deg, var(--accent-oxygen), var(--accent-hydrogen))',
            transition: 'transform 120ms linear',
          }}
        />
      </div>
    </>
  );
}
