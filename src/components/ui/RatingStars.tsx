import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingStarsProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
  ariaLabel?: string;
}

const sizeClasses = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function RatingStars({
  value,
  size = "md",
  showValue = false,
  className,
  ariaLabel,
}: RatingStarsProps) {
  const percentage = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={ariaLabel ?? `${value} de 5 estrellas`}
    >
      <span className="relative inline-flex" aria-hidden>
        <span className="flex gap-0.5 text-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(sizeClasses[size], "fill-current")} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-warning"
          style={{ width: `${percentage}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(sizeClasses[size], "shrink-0 fill-current")} />
          ))}
        </span>
      </span>
      {showValue ? (
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {value.toFixed(1)}
        </span>
      ) : null}
    </span>
  );
}
