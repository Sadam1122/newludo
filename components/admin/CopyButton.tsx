"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

type CopyButtonProps = {
  value: string;
};

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={copyValue}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-bold uppercase text-white transition hover:border-ludo-gold hover:text-ludo-gold"
    >
      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
