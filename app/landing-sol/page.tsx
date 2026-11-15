// [DECISION: Isolated desktop art-direction preview; all experience code is local frontend assets.]
// Rendering strategy: static page with a self-contained full-screen frontend canvas.
export default function LandingSolPage() {
  return (
    <iframe
      src="/landing-sol/experience.html"
      title="Hylono — Open possibilities"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', border: 0, zIndex: 2147483000, background: '#fcfcf8' }}
    />
  );
}
