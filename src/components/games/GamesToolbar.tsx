"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export interface GamesToolbarProps {
  q?: string;
  genre?: string;
  platform?: string;
  sort?: string;
  total: number;
  genres: Array<{ slug: string; name: string }>;
  platforms: Array<{ slug: string; name: string }>;
}

export const sortOptions = [
  { value: "popularity", label: "Popularidad" },
  { value: "rating", label: "Mejor valorados" },
  { value: "date", label: "Fecha de lanzamiento" },
  { value: "name", label: "Nombre (A-Z)" },
];

const selectClass =
  "h-10 rounded-input border border-border bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function GamesToolbar({
  q = "",
  genre = "",
  platform = "",
  sort = "popularity",
  total,
  genres,
  platforms,
}: GamesToolbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  const apply = (patch: Partial<{ q: string; genre: string; platform: string; sort: string }>) => {
    const params = new URLSearchParams();
    const next = { q: query, genre, platform, sort, ...patch };
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.genre) params.set("genre", next.genre);
    if (next.platform) params.set("platform", next.platform);
    if (next.sort && next.sort !== "popularity") params.set("sort", next.sort);
    const qs = params.toString();
    router.replace(qs ? `/games?${qs}` : "/games");
  };

  const hasFilters = Boolean(query.trim() || genre || platform);

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply({});
        }}
        className="flex items-center gap-2"
        role="search"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, descripción o desarrollador…"
            aria-label="Buscar juegos"
            className="h-10 w-full rounded-pill border border-border bg-background pr-9 pl-10 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
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
        <button
          type="submit"
          className="h-10 shrink-0 rounded-card bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-muted">
          Género
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

        <label className="flex items-center gap-2 text-sm text-muted">
          Plataforma
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

        <label className="flex items-center gap-2 text-sm text-muted">
          Ordenar
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

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              apply({ q: "", genre: "", platform: "" });
            }}
            className="inline-flex items-center gap-1 rounded-card border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            <X className="size-4" aria-hidden />
            Limpiar filtros
          </button>
        ) : null}

        <span className="ml-auto text-sm text-muted" aria-live="polite">
          {total.toLocaleString("es-ES")} {total === 1 ? "juego" : "juegos"}
        </span>
      </div>
    </div>
  );
}
