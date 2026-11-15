export function LandingPicture({
  name,
  alt,
  hero = false,
  className,
  mobileHero,
}: {
  name: 'room' | 'ritual';
  alt: string;
  hero?: boolean;
  className?: string;
  mobileHero?: string;
}) {
  const widths = name === 'room' ? [640, 960, 1440, 1920] : [480, 800, 1200];
  const sizes =
    name === 'room'
      ? '(max-width: 760px) calc(100vw - 32px), (max-width: 1440px) calc(100vw - 96px), 1344px'
      : '(max-width: 760px) calc(100vw - 32px), 40vw';
  return (
    <picture className={className}>
      {hero && mobileHero && (
        <source media="(max-width: 760px)" type="image/avif" srcSet={mobileHero} />
      )}
      <source
        type="image/avif"
        srcSet={widths.map((w) => `/images/landing-2026/${name}-${w}.avif ${w}w`).join(', ')}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={widths.map((w) => `/images/landing-2026/${name}-${w}.webp ${w}w`).join(', ')}
        sizes={sizes}
      />
      <img
        src={`/images/landing-2026/${name}-${widths[1]}.webp`}
        alt={alt}
        width={name === 'room' ? 1536 : 1024}
        height={name === 'room' ? 1024 : 1536}
        loading={hero ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={hero ? 'high' : 'auto'}
      />
    </picture>
  );
}
