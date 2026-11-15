import localFont from 'next/font/local';

// Self-hosted brand faces already shipped with the landing page. next/font adds
// preload hints, font-display: swap and a metric-matched fallback to limit layout shift.
export const editorial = localFont({
  src: [
    {
      path: '../../../public/fonts/landing-2026/cormorant-latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/landing-2026/cormorant-latin-italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--opus-serif',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const identity = localFont({
  src: '../../../public/fonts/landing-2026/syncopate-latin-700.woff2',
  weight: '700',
  variable: '--opus-identity',
  display: 'swap',
  preload: false,
  fallback: ['Arial Black', 'Arial', 'sans-serif'],
});
