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
          <h2>حدث خطأ مؤقت</h2>
          <p>يرجى إعادة تحميل الصفحة أو تسجيل الدخول من جديد.</p>
          <button onClick={() => reset()}>إعادة المحاولة</button>
        </div>
      </body>
    </html>
  );
}
