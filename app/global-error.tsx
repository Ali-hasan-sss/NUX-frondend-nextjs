'use client';
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error?.message || '';
  const isStaleBuild =
    message.includes('Server Action') ||
    message.includes('ChunkLoadError') ||
    error?.name === 'ChunkLoadError';
  if (typeof window !== 'undefined' && isStaleBuild) {
    window.location.reload();
  }
  return (
    <html>
      <body>
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h2>Temporary error</h2>
          <p>Please reload the page or sign in again.</p>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
