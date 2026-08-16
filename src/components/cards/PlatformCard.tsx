import { Monitor, Gamepad2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Platform } from "@/types/platform";
import { cn } from "@/lib/utils";

const iconBySlug: Record<string, LucideIcon> = {
  pc: Monitor,
  playstation: Gamepad2,
  xbox: Gamepad2,
  switch: Gamepad2,
  mac: Monitor,
  linux: Monitor,
};

const descriptionBySlug: Partial<Record<string, string>> = {
  pc: "Juega en tu ordenador",
  playstation: "Consola de sobremesa",
  xbox: "Consola de sobremesa",
  switch: "Consola híbrida",
  mac: "Juega en macOS",
  linux: "Juega en Linux",
};

export interface PlatformCardProps {
  platform: Platform;
  gameCount?: number;
  className?: string;
}

export function PlatformCard({ platform, gameCount = 0, className }: PlatformCardProps) {
  const Icon = iconBySlug[platform.slug] ?? Gamepad2;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent/50",
        className,
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-card bg-accent/10 text-accent">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-semibold text-foreground">{platform.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted">
          {descriptionBySlug[platform.slug] ?? "Plataforma disponible"}
        </p>
      </div>
      <span className="shrink-0 rounded-input border border-border bg-surface-raised px-2 py-1 text-xs font-bold text-foreground">
        {gameCount.toLocaleString("es-ES")}
      </span>
    </div>
  );
}
