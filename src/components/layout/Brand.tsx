import Link from "next/link";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Typewriter } from "@/components/ui/Typewriter";

export interface BrandProps {
  className?: string;
  name?: string;
  tagline?: string;
  logoUrl?: string | null;
  animate?: boolean;
}

export function Brand({
  className,
  name = siteConfig.name,
  tagline = siteConfig.tagline,
  logoUrl,
  animate = false,
}: BrandProps) {
  return (
    <Link
      href="/"
      aria-label={`${name} — inicio`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      {logoUrl ? (
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-surface">
          <Image
            src={logoUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-full w-full object-contain"
          />
        </span>
      ) : (
        <span className="flex size-9 items-center justify-center rounded-card bg-gradient-to-br from-accent to-accent-2 text-white shadow-lg shadow-accent/30 transition-transform duration-200 group-hover:scale-105">
          <Gamepad2 className="size-5" aria-hidden />
        </span>
      )}
      <span className="flex flex-col leading-none">
        {animate ? (
          <Typewriter
            text={name}
            className="font-display text-lg font-bold tracking-tight text-foreground"
          />
        ) : (
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            {name}
          </span>
        )}
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
          {tagline}
        </span>
      </span>
    </Link>
  );
}
