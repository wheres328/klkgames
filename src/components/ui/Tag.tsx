import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TagProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

export function Tag({ children, className, href }: TagProps) {
  const classes = cn(
    "inline-flex items-center rounded-input border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground",
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return <span className={classes}>{children}</span>;
}
