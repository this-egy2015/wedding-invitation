"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy Link", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setFailed(true);
    }
  }

  return (
    <button type="button" onClick={copy} className={className ?? "btn-secondary"} aria-live="polite">
      {failed ? "Gagal menyalin, coba lagi" : copied ? "Tersalin" : label}
    </button>
  );
}
