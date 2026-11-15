'use client';

export function FaqClient({ hideIntro = false }: { hideIntro?: boolean }) {
  return (
    <div
      data-testid="faq-client"
      data-hide-intro={String(hideIntro)}
      className="hidden"
      aria-hidden="true"
    />
  );
}
