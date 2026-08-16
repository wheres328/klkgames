"use client";

import { useState } from "react";
import { Bitcoin, Check, Copy, ExternalLink, Heart, Wallet } from "lucide-react";
import type { Donation } from "@/types/donation";
import { DONATION_PLATFORM_LABELS } from "@/components/admin/constants";
import { cn } from "@/lib/utils";

const platformIcons: Record<string, typeof Heart> = {
  PATREON: Heart,
  PAYPAL: Wallet,
  CRYPTO: Bitcoin,
};

function AddressCopy({ address, label }: { address: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sin permisos de portapapeles: se ignora.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group mt-3 flex w-full items-center justify-between gap-2 rounded-input border border-border bg-surface-raised px-3 py-2 text-left"
      title="Copiar dirección"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold tracking-wider text-muted uppercase">
          {label}
        </span>
        <span className="block truncate text-xs text-muted group-hover:text-foreground">
          {address}
        </span>
      </span>
      {copied ? (
        <Check className="size-4 shrink-0 text-success" aria-hidden />
      ) : (
        <Copy className="size-4 shrink-0 text-muted" aria-hidden />
      )}
    </button>
  );
}

export function DonateGrid({ donations }: { donations: Donation[] }) {
  if (donations.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {donations.map((donation) => {
        const Icon = platformIcons[donation.platform] ?? Heart;
        const platformLabel =
          DONATION_PLATFORM_LABELS[donation.platform] ?? donation.platform;
        return (
          <div
            key={donation.id}
            className="flex flex-col rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-input bg-accent/10 text-accent-2">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-display font-bold text-foreground">
                  {donation.label ?? platformLabel}
                </p>
                <p className="text-xs text-muted">{platformLabel}</p>
              </div>
            </div>

            {donation.address ? (
              <div className="mt-2">
                <AddressCopy
                  address={donation.address}
                  label={donation.platform === "CRYPTO" ? "Dirección de la billetera" : "Dato de pago"}
                />
              </div>
            ) : null}

            <a
              href={donation.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-4 inline-flex items-center justify-center gap-2 rounded-input px-4 py-2 text-sm font-semibold transition-all",
                "bg-gradient-to-r from-accent to-accent-2 text-white shadow-lg shadow-accent/30 hover:shadow-accent/50",
              )}
            >
              Donar ahora
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </div>
        );
      })}
    </div>
  );
}
