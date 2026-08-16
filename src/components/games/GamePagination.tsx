import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GamePaginationProps {
  current: number;
  total: number;
  buildHref: (page: number) => string;
  className?: string;
}

function getPageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const candidates = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...candidates].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const items: (number | "…")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) items.push("…");
    items.push(page);
    previous = page;
  }
  return items;
}

export function GamePagination({ current, total, buildHref, className }: GamePaginationProps) {
  if (total <= 1) return null;

  const pages = getPageItems(current, total);

  const pageClass = (active: boolean) =>
    cn(
      "flex size-9 items-center justify-center rounded-card text-sm font-medium transition-colors",
      active
        ? "bg-accent text-white"
        : "border border-border bg-surface text-muted hover:border-accent/40 hover:text-accent",
    );

  return (
    <nav
      aria-label="Paginación"
      className={cn("mt-10 flex items-center justify-center gap-2", className)}
    >
      <Link
        href={buildHref(current - 1)}
        aria-label="Página anterior"
        aria-disabled={current === 1}
        tabIndex={current === 1 ? -1 : undefined}
        className={cn(
          "flex size-9 items-center justify-center rounded-card border border-border bg-surface text-muted transition-colors",
          current === 1
            ? "pointer-events-none opacity-40"
            : "hover:border-accent/40 hover:text-accent",
        )}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Link>

      {pages.map((page, index) =>
        page === "…" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden
            className="flex size-9 items-center justify-center text-sm text-muted"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={pageClass(page === current)}
            aria-current={page === current ? "page" : undefined}
          >
            {page}
          </Link>
        ),
      )}

      <Link
        href={buildHref(current + 1)}
        aria-label="Página siguiente"
        aria-disabled={current === total}
        tabIndex={current === total ? -1 : undefined}
        className={cn(
          "flex size-9 items-center justify-center rounded-card border border-border bg-surface text-muted transition-colors",
          current === total
            ? "pointer-events-none opacity-40"
            : "hover:border-accent/40 hover:text-accent",
        )}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </nav>
  );
}
