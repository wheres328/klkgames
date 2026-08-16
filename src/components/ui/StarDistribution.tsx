import type { StarDistribution as StarDistributionType } from "@/types/game";
import { cn } from "@/lib/utils";

export interface StarDistributionProps {
  distribution: StarDistributionType[];
  className?: string;
}

export function StarDistribution({ distribution, className }: StarDistributionProps) {
  const rows = [...distribution].sort((a, b) => b.stars - a.stars);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {rows.map((row) => (
        <div key={row.stars} className="flex items-center gap-3 text-xs">
          <span className="w-8 shrink-0 tabular-nums text-muted">{row.stars}★</span>
          <div
            className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-raised"
            role="presentation"
          >
            <div
              className="h-full rounded-pill bg-gradient-to-r from-accent to-accent-2 transition-all"
              style={{ width: `${row.percentage}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right tabular-nums text-muted">
            {row.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
}
