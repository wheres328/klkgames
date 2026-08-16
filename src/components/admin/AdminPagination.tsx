import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}

function buildHref(basePath: string, page: number, params?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
  }
  search.set("page", String(page));
  return `${basePath}?${search.toString()}`;
}

export function AdminPagination({ basePath, page, totalPages, params }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1.5 py-4">
      {page > 1 ? (
        <Link
          href={buildHref(basePath, page - 1, params)}
          className="flex h-8 items-center gap-1 rounded-input border border-border bg-surface px-2.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          Anterior
        </Link>
      ) : (
        <span className="flex h-8 items-center gap-1 rounded-input border border-border bg-surface px-2.5 text-xs text-muted/50 opacity-50">
          <ChevronLeft className="size-3.5" aria-hidden />
          Anterior
        </span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((item, index) =>
          item === "…" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-xs text-muted">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildHref(basePath, item, params)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-input border text-xs font-medium transition-colors",
                item === page
                  ? "border-transparent bg-gradient-to-r from-accent to-accent-2 text-white"
                  : "border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground",
              )}
            >
              {item}
            </Link>
          ),
        )}
      </div>

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, page + 1, params)}
          className="flex h-8 items-center gap-1 rounded-input border border-border bg-surface px-2.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          Siguiente
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      ) : (
        <span className="flex h-8 items-center gap-1 rounded-input border border-border bg-surface px-2.5 text-xs text-muted/50 opacity-50">
          Siguiente
          <ChevronRight className="size-3.5" aria-hidden />
        </span>
      )}
    </nav>
  );
}
