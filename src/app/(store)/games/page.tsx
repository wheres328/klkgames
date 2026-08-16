import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { GameRowList } from "@/components/cards/GameRowList";
import { GamePagination } from "@/components/games/GamePagination";
import { GamesFilters } from "@/components/games/GamesFilters";
import { GamesFiltersDialog } from "@/components/games/GamesFiltersDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { searchGames, type GameSortKey } from "@/server/services/searchService";
import { listGenres } from "@/server/services/genreService";
import { listPlatforms } from "@/server/services/platformService";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Juegos",
  description: `Explora el catálogo de ${siteConfig.name}: filtra por género y plataforma, ordena por popularidad o valoración y encuentra tu próximo juego.`,
};

const PAGE_SIZE = 18;

const SORT_KEYS: GameSortKey[] = ["popularity", "rating", "date", "name"];

export interface GamesPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    platform?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const genre = params.genre ?? "";
  const platform = params.platform ?? "";
  const status = params.status ?? "";
  const sort = SORT_KEYS.includes(params.sort as GameSortKey)
    ? (params.sort as GameSortKey)
    : "popularity";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [result, genres, platforms] = await Promise.all([
    searchGames({ q, genre, platform, status, sort, page, pageSize: PAGE_SIZE }),
    listGenres(),
    listPlatforms(),
  ]);

  const { items: pageItems, total, totalPages, currentPage } = result;

  const buildHref = (targetPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (genre) sp.set("genre", genre);
    if (platform) sp.set("platform", platform);
    if (status) sp.set("status", status);
    if (sort !== "popularity") sp.set("sort", sort);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `/games?${qs}` : "/games";
  };

  return (
    <div className="py-10">
      <Container>
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Catálogo</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Juegos
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Explora el catálogo completo, filtra por género, plataforma y estado, y ordena los
          resultados a tu gusto.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Panel de filtros (desktop, sticky) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-card border border-border bg-surface/60 p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <SlidersHorizontal className="size-4 text-accent" aria-hidden />
                Filtros
              </h2>
              <div className="mt-4">
                <GamesFilters
                  q={q}
                  genre={genre}
                  platform={platform}
                  status={status}
                  sort={sort}
                  total={total}
                  genres={genres}
                  platforms={platforms}
                />
              </div>
            </div>
          </aside>

          {/* Resultados */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted" aria-live="polite">
                {total.toLocaleString("es-ES")} {total === 1 ? "juego" : "juegos"}
              </p>
              <GamesFiltersDialog
                q={q}
                genre={genre}
                platform={platform}
                status={status}
                sort={sort}
                total={total}
                genres={genres}
                platforms={platforms}
              />
            </div>

            {pageItems.length > 0 ? (
              <GameRowList games={pageItems} showDate className="mt-4" />
            ) : (
              <EmptyState
                title="Sin resultados"
                description="No encontramos juegos con esos filtros. Prueba a quitar alguna condición o a cambiar la búsqueda."
                className="mt-4"
              />
            )}

            <GamePagination current={currentPage} total={totalPages} buildHref={buildHref} />
          </div>
        </div>
      </Container>
    </div>
  );
}
