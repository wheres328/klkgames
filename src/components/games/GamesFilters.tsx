"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

export interface GamesFiltersProps {
  q?: string;
  genre?: string;
  platform?: string;
  status?: string;
  sort?: string;
  total: number;
  genres: Array<{ slug: string; name: string }>;
  platforms: Array<{ slug: string; name: string }>;
  onSubmit?: () => void;
  className?: string;
}

export const sortOptions = [
  { value: "popularity", label: "Popularidad" },
  { value: "rating", label: "Mejor valorados" },
  { value: "date", label: "Fecha de lanzamiento" },
  { value: "name", label: "Nombre (A-Z)" },
];

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "released", label: "Lanzado" },
  { value: "early-access", label: "Acceso anticipado" },
  { value: "upcoming", label: "Próximamente" },
  { value: "demo", label: "Demo" },
  { value: "abandoned", label: "Abandonado" },
];

const selectClass =
  "h-10 w-full rounded-input border border-border bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
      {children}
    </span>
  );
}

export function GamesFilters({
  q = "",
  genre = "",
  platform = "",
  status = "",
  sort = "popularity",
  total,
  genres,
  platforms,
  onSubmit,
  className,
}: GamesFiltersProps) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  const apply = (
    patch: Partial<{ q: string; genre: string; platform: string; status: string; sort: string }>,
  ) => {
    const params = new URLSearchParams();
    const next = { q: query, genre, platform, status, sort, ...patch };
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.genre) params.set("genre", next.genre);
    if (next.platform) params.set("platform", next.platform);
    if (next.status) params.set("status", next.status);
    if (next.sort && next.sort !== "popularity") params.set("sort", next.sort);
    const qs = params.toString();
    router.replace(qs ? `/games?${qs}` : "/games");
    onSubmit?.();
  };

  const hasFilters = Boolean(query.trim() || genre || platform || status);

  return (
    <div className={className}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply({});
        }}
        role="search"
        className="flex flex-col gap-2"
      >
        <FilterLabel>Buscar</FilterLabel>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, desarrollador…"
            aria-label="Buscar juegos"
            className="h-10 w-full rounded-input border border-border bg-background pr-9 pl-9 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          {query ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-2.5 my-auto flex size-5 items-center justify-center rounded-input text-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <label className="flex flex-col gap-1.5">
            <FilterLabel>Género</FilterLabel>
            <select
              value={genre}
              onChange={(event) => apply({ genre: event.target.value })}
              className={selectClass}
            >
              <option value="">Todos</option>
              {genres.map((genreItem) => (
                <option key={genreItem.slug} value={genreItem.slug}>
                  {genreItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <FilterLabel>Plataforma</FilterLabel>
            <select
              value={platform}
              onChange={(event) => apply({ platform: event.target.value })}
              className={selectClass}
            >
              <option value="">Todas</option>
              {platforms.map((platformItem) => (
                <option key={platformItem.slug} value={platformItem.slug}>
                  {platformItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <FilterLabel>Estado</FilterLabel>
            <select
              value={status}
              onChange={(event) => apply({ status: event.target.value })}
              className={selectClass}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <FilterLabel>Ordenar por</FilterLabel>
            <select
              value={sort}
              onChange={(event) => apply({ sort: event.target.value })}
              className={selectClass}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-card bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
          >
            <Search className="size-4" aria-hidden />
            Aplicar filtros
          </button>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                apply({ q: "", genre: "", platform: "", status: "" });
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-card border border-border text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <X className="size-4" aria-hidden />
              Limpiar filtros
            </button>
          ) : null}
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted" aria-live="polite">
          <SlidersHorizontal className="size-3.5" aria-hidden />
          {total.toLocaleString("es-ES")} {total === 1 ? "juego" : "juegos"}
        </p>
      </form>
    </div>
  );
}
