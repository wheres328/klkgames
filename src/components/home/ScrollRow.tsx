import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ScrollRowProps {
  children: ReactNode;
  className?: string;
}

export function ScrollRow({ children, className }: ScrollRowProps) {
  return (
    <div
      className={cn(
        "scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
