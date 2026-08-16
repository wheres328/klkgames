import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Algo salió mal",
  description = "Ocurrió un error inesperado. Inténtalo de nuevo en unos instantes.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-danger/30 bg-danger/5 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-input bg-danger/15 text-danger">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        <p className="max-w-sm text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
