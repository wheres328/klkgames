import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { GameRowList } from "@/components/cards/GameRowList";
import { GenreArt } from "@/components/ui/GenreArt";
import { resolveGenrePattern } from "@/lib/genre-art";
import { getGenreBySlug, listGenres } from "@/server/services/genreService";
import { getGamesByGenre } from "@/server/services/gameService";

export interface GenrePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const genres = await listGenres();
  return genres.map((genre) => ({ slug: genre.slug }));
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenreBySlug(slug);
  if (!genre) return { title: "Género no encontrado" };
  return {
    title: `Juegos de ${genre.name}`,
    description: genre.description,
  };
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = await params;
  const genre = await getGenreBySlug(slug);
  if (!genre) notFound();

  const genreGames = await getGamesByGenre(genre.slug);

  return (
    <div className="py-10">
      <Container>
        <Link
          href="/genres"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a géneros
        </Link>

        <div className="relative mt-6 overflow-hidden rounded-card border border-border">
          {genre.image ? (
            <Image src={genre.image} alt={genre.name} fill sizes="100vw" className="object-cover" />
          ) : (
            <GenreArt
              {...resolveGenrePattern(genre)}
              accentFrom={genre.accentFrom}
              accentTo={genre.accentTo}
              className="absolute inset-0 h-full w-full"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
          <div className="relative flex min-h-[260px] flex-col justify-end p-6 sm:p-10">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{genre.name}</h1>
            <p className="mt-3 max-w-xl text-sm text-white/80">{genre.description}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-input bg-white/10 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <LayoutGrid className="size-3.5" aria-hidden />
              {genre.gameCount.toLocaleString("es-ES")} juegos
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Juegos de {genre.name} en la plataforma
          </h2>
          {genreGames.length > 0 ? (
            <div className="mt-5">
              <GameRowList games={genreGames} showDate withHeader />
            </div>
          ) : (
            <p className="mt-5 rounded-card border border-dashed border-border bg-surface/40 p-8 text-sm text-muted">
              Todavía no hay juegos de {genre.name} publicados en el catálogo.
            </p>
          )}
        </section>
      </Container>
    </div>
  );
}
