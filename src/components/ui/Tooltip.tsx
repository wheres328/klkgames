import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const positionClasses = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-60 rounded-input bg-foreground px-2.5 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          positionClasses[side],
        )}
      >
        {label}
      </span>
    </span>
  );
}
