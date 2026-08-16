"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Clapperboard } from "lucide-react";
import type { Game } from "@/types/game";
import type { GenreRef } from "@/types/genre";
import { Container } from "@/components/layout/Container";
import { Dialog } from "@/components/ui/Dialog";
import { Tag } from "@/components/ui/Tag";
import { RatingStars } from "@/components/ui/RatingStars";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { formatDate } from "@/lib/format";
import { getGameImages } from "@/lib/game-images";

export interface HomeHeroProps {
  game: Game | null;
  genres: GenreRef[];
}

export function HomeHero({ game, genres }: HomeHeroProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  if (!game) return null;

  const trailer = game.videos.find((video) => video.type === "trailer") ?? game.videos[0];
  const { banner } = getGameImages(game);

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Fondo atmosférico: banner con blur + opacidad + fade hacia el fondo */}
      <Image
        src={banner.url}
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-110 object-cover opacity-60 blur-lg"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
      <div aria-hidden className="bg-grid-fade absolute inset-0 opacity-40" />

      <Container className="relative flex min-h-[440px] flex-col justify-end py-12 sm:min-h-[500px]">
        <div className="max-w-2xl animate-rise-in">
          <div className="flex flex-wrap items-center gap-2">
            {genres.slice(0, 3).map((genre) => (
              <Tag key={genre.slug}>{genre.name}</Tag>
            ))}
          </div>

          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            {game.name}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {game.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <RatingStars value={game.rating} size="md" />
              <span className="font-semibold text-foreground">{game.rating}</span>
              <span className="text-muted">({game.ratingCount.toLocaleString("es-ES")})</span>
            </span>
            <span className="text-muted">{formatDate(game.releaseDate, "long")}</span>
            <span className="text-muted">{game.developer}</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/games/${game.slug}`}
              className="inline-flex items-center gap-2 rounded-card bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent-2 hover:shadow-accent/40"
            >
              <Play className="size-4 fill-current" aria-hidden />
              Jugar ahora
            </Link>
            <button
              type="button"
              onClick={() => setTrailerOpen(true)}
              className="inline-flex items-center gap-2 rounded-card border border-border bg-surface/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-accent/50"
            >
              <Clapperboard className="size-4" aria-hidden />
              Ver tráiler
            </button>
          </div>
        </div>
      </Container>

      <Dialog
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={`${game.name} — Tráiler`}
        className="sm:max-w-3xl"
      >
        <div className="relative aspect-video overflow-hidden rounded-card border border-border bg-black">
          <VideoPlayer src={trailer?.url} title={`${game.name} — Tráiler`} />
        </div>
      </Dialog>
    </section>
  );
}
