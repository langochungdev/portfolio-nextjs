"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Something went wrong</h1>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f5f5f5", padding: "1rem", borderRadius: 8, fontSize: "0.875rem" }}>
          {error.message}
        </pre>
        <button
          onClick={reset}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer", borderRadius: 6, border: "1px solid #ccc", background: "#fff" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
