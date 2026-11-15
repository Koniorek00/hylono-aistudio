'use client';

/**
 * VitalitySpotlightCard — a border-beam and surface sheen that tracks the pointer.
 *
 * PATTERN CREDIT
 *
 * Re-implemented from the `BentoGridRadialSpotlight` reference (c20) in the
 * `web-addons-lib` toolbox. Two ideas are kept and nothing is vendored:
 *
 *  1. A one-and-a-half-pixel gradient BEAM drawn with a double-layer mask
 *     (`mask-composite: exclude` over a padded ring), so the light appears only
 *     on the card's own border and not as a filled wash.
 *  2. A separate, wider SHEEN layer on the surface, both driven by the same
 *     `--mx` / `--my` custom properties.
 *
 * The reference class is a vanilla WebGL-free DOM engine with its own rAF loop
 * and imperative `destroy()`. This is the React shape of the same idea: a
 * spring that chases the pointer, written with `requestAnimationFrame` inside a
 * single effect and cancelled on unmount. The loop is only running between a
 * pointer event and the moment the spring settles, and it never starts at all
 * under `prefers-reduced-motion: reduce` — in that mode both layers stay at
 * their rest state and the card is still fully readable and fully clickable.
 *
 * No layout reads happen in the pointer handler: the event is read once for its
 * client coordinates and the rest is interpolation.
 */

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
} from 'react';

const BEAM_STIFFNESS = 0.18;
const SETTLE_EPSILON = 0.35;

interface VitalitySpotlightCardProps {
  children: React.ReactNode;
  /** CSS custom property holding the beam colour. Defaults to the oxygen accent. */
  accentVar?: string;
  className?: string;
  /** Radius of the border beam, in pixels. */
  beamRadius?: number;
  /** Radius of the surface sheen, in pixels. */
  sheenRadius?: number;
}

export function VitalitySpotlightCard({
  accentVar = '--accent-oxygen',
  beamRadius = 240,
  children,
  className = '',
  sheenRadius = 340,
}: VitalitySpotlightCardProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) {
      return;
    }

    const reduceMotionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    let frame = 0;
    let active = false;

    const write = () => {
      const { x, y } = positionRef.current;
      surface.style.setProperty('--mx', `${x.toFixed(1)}px`);
      surface.style.setProperty('--my', `${y.toFixed(1)}px`);
    };

    const step = () => {
      const target = targetRef.current;
      const position = positionRef.current;
      const dx = target.x - position.x;
      const dy = target.y - position.y;

      position.x += dx * BEAM_STIFFNESS;
      position.y += dy * BEAM_STIFFNESS;
      write();

      if (Math.abs(dx) < SETTLE_EPSILON && Math.abs(dy) < SETTLE_EPSILON) {
        frame = 0;
        active = false;
        return;
      }

      frame = window.requestAnimationFrame(step);
    };

    const start = () => {
      if (active || reduceMotionQuery?.matches) {
        return;
      }

      active = true;
      frame = window.requestAnimationFrame(step);
    };

    const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reduceMotionQuery?.matches) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      targetRef.current = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      start();
    };

    const onPointerLeave = () => {
      targetRef.current = { x: 0, y: 0 };
      start();
    };

    const onMotionPreferenceChange = () => {
      if (reduceMotionQuery?.matches) {
        positionRef.current = { x: 0, y: 0 };
        targetRef.current = { x: 0, y: 0 };
        write();
      }
    };

    surface.addEventListener(
      'pointermove',
      onPointerMove as unknown as EventListener
    );
    surface.addEventListener(
      'pointerleave',
      onPointerLeave as unknown as EventListener
    );
    reduceMotionQuery?.addEventListener('change', onMotionPreferenceChange);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }

      surface.removeEventListener(
        'pointermove',
        onPointerMove as unknown as EventListener
      );
      surface.removeEventListener(
        'pointerleave',
        onPointerLeave as unknown as EventListener
      );
      reduceMotionQuery?.removeEventListener(
        'change',
        onMotionPreferenceChange
      );
    };
  }, []);

  const surfaceStyle = {
    // Rest position is the top edge, so the beam reads as light entering.
    '--mx': '50%',
    '--my': '0%',
  } as unknown as CSSProperties;

  return (
    <div
      ref={surfaceRef}
      className={`group relative isolate overflow-hidden ${className}`.trim()}
      style={surfaceStyle}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-[inherit] p-[1.5px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none motion-reduce:duration-0"
        style={{
          background: `radial-gradient(${beamRadius}px circle at var(--mx) var(--my), var(${accentVar}), transparent 70%)`,
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none motion-reduce:duration-0"
        style={{
          background: `radial-gradient(${sheenRadius}px circle at var(--mx) var(--my), color-mix(in srgb, var(${accentVar}) 12%, transparent), transparent 65%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
