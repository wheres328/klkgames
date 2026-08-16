import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { GenreCard } from "@/components/cards/GenreCard";
import { listGenres } from "@/server/services/genreService";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Géneros",
  description: `Explora el catálogo de ${siteConfig.name} por género: RPG, survival, sandbox, horror y más.`,
};

export default async function GenresPage() {
  const genres = await listGenres();

  return (
    <div className="py-10">
      <Container>
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Categorías</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Géneros
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Desde supervivencia hasta roguelikes: encuentra tu próxima obsesión explorando por género.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {genres.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      </Container>
    </div>
  );
}
