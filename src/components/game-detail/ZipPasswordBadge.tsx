"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function ZipPasswordBadge({ password }: { password: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <span className="inline-flex items-center gap-2">
      <code className="rounded-input border border-border bg-background px-2.5 py-1 font-mono text-sm font-semibold tracking-wide text-accent">
        {password}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar contraseña"
        title="Copiar contraseña"
        className="inline-flex size-7 items-center justify-center rounded-input border border-border text-muted transition-colors hover:text-accent"
      >
        {copied ? <Check className="size-4 text-accent" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      </button>
    </span>
  );
}
