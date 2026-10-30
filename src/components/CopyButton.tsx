"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy Link", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" onClick={copy} className={className ?? "btn-secondary"}>
      {copied ? "Tersalin" : label}
    </button>
  );
}
