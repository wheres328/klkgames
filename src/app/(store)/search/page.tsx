import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { GameRowList } from "@/components/cards/GameRowList";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { GenreCard } from "@/components/cards/GenreCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getGlobalSuggestions } from "@/server/services/suggestionService";
import { searchArticles, searchGames } from "@/server/services/searchService";
import { listGenres } from "@/server/services/genreService";

export const metadata: Metadata = {
  title: "Búsqueda",
  description: "Busca juegos, géneros y artículos en la plataforma.",
};

export interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const needle = q?.trim() ?? "";
  const needleLower = needle.toLowerCase();

  const [suggestions, genres] = await Promise.all([getGlobalSuggestions(), listGenres()]);

  const [gameResult, matchingArticles] = await Promise.all([
    needle ? searchGames({ q: needle, pageSize: 8 }) : Promise.resolve(null),
    needle ? searchArticles(needle) : Promise.resolve([]),
  ]);
  const matchingGames = gameResult?.items ?? [];

  const matchingGenres = needle
    ? genres.filter(
        (genre) =>
          genre.name.toLowerCase().includes(needleLower) ||
          genre.description.toLowerCase().includes(needleLower),
      )
    : [];

  const total = matchingGames.length + matchingArticles.length + matchingGenres.length;

  return (
    <div className="py-10">
      <Container>
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Búsqueda</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Buscar
        </h1>

        <div className="mt-6 max-w-2xl">
          <SearchInput suggestions={suggestions} />
        </div>

        {!needle ? (
          <div className="mt-10">
            <EmptyState
              icon={Search}
              title="¿Qué estás buscando?"
              description="Escribe un término para encontrar juegos, géneros o artículos en la plataforma."
            />
          </div>
        ) : total === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={Search}
              title={`Sin resultados para "${q}"`}
              description="Prueba con otro término o elimina algunos filtros."
            />
          </div>
        ) : (
          <div className="mt-10">
            <p className="text-sm text-muted" aria-live="polite">
              {total} {total === 1 ? "resultado" : "resultados"} para{" "}
              <span className="font-semibold text-foreground">“{q}”</span>
            </p>

            {matchingGames.length > 0 && (
              <section className="mt-8">
                <SectionHeader eyebrow="Juegos" title="Juegos" />
                <div className="mt-5">
                  <GameRowList games={matchingGames.slice(0, 8)} showDate withHeader />
                </div>
              </section>
            )}

            {matchingArticles.length > 0 && (
              <section className="mt-10">
                <SectionHeader eyebrow="Artículos" title="Artículos" />
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {matchingArticles.slice(0, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {matchingGenres.length > 0 && (
              <section className="mt-10">
                <SectionHeader eyebrow="Géneros" title="Géneros" />
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {matchingGenres.map((genre) => (
                    <GenreCard key={genre.id} genre={genre} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
