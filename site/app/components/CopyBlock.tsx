"use client";

import { useState } from "react";

export function CopyBlock({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="usage-preformatted usage-code-block">
      <button
        className="usage-copy-button"
        type="button"
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        aria-live="polite"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="14" height="14" x="8" y="8" rx="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}
