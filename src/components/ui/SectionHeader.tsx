import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
        )}
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-2"
        >
          {action.label}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}
