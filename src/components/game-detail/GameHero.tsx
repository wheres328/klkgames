"use client";

import { useState } from "react";
import Image from "next/image";
import { Clapperboard, Download, Heart, Play, Share2 } from "lucide-react";
import type { Game } from "@/types/game";
import type { GenreRef } from "@/types/genre";
import type { PlatformRef } from "@/types/platform";
import { Container } from "@/components/layout/Container";
import { Dialog } from "@/components/ui/Dialog";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { useToast } from "@/components/ui/Toast";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { toggleFavoriteAction } from "@/server/actions/favorite";
import { formatDate } from "@/lib/format";
import { getGameImages } from "@/lib/game-images";
import { cn } from "@/lib/utils";

export interface GameHeroProps {
  game: Game;
  genres: GenreRef[];
  platforms: PlatformRef[];
  gameId: string;
  initialFavorited?: boolean;
}

export function GameHero({
  game,
  genres,
  platforms,
  gameId,
  initialFavorited = false,
}: GameHeroProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [favorite, setFavorite] = useState(Boolean(initialFavorited));
  const [favoritePending, setFavoritePending] = useState(false);
  const { toast } = useToast();
  const trailer = game.videos.find((video) => video.type === "trailer") ?? game.videos[0];
  const { cover, banner } = getGameImages(game);

  const toggleFavorite = async () => {
    if (favoritePending) return;
    setFavoritePending(true);
    try {
      const result = await toggleFavoriteAction({ gameId });
      if (result.ok) {
        setFavorite(result.favorited);
        toast({
          title: result.favorited ? "Añadido a favoritos" : "Eliminado de favoritos",
          description: game.name,
          variant: result.favorited ? "success" : "info",
        });
      } else {
        toast({ title: result.error, variant: "error" });
      }
    } finally {
      setFavoritePending(false);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Fondo atmosférico: banner con blur + opacidad + fade */}
      <Image
        src={banner.url}
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-110 object-cover opacity-50 blur-xl"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/60" />
      <div aria-hidden className="bg-grid-fade absolute inset-0 opacity-30" />

      <Container className="relative grid gap-8 py-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-end lg:py-14">
        {/* Cover */}
        <div className="mx-auto w-full max-w-[260px] lg:max-w-none">
          <div className="relative aspect-[3/4] overflow-hidden rounded-card border border-border shadow-2xl shadow-black/60">
            <Image
              src={cover.url}
              alt={cover.alt ?? game.name}
              fill
              priority
              sizes="(max-width: 1024px) 260px, 300px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Información */}
        <div className="min-w-0 animate-rise-in">
          <div className="flex flex-wrap items-center gap-2">
            {genres.map((genre) => (
              <Tag key={genre.slug}>{genre.name}</Tag>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
              {game.name}
            </h1>
            {game.status === "early-access" && <Badge variant="warning">Acceso anticipado</Badge>}
            {game.status === "upcoming" && <Badge variant="accent">Próximamente</Badge>}
          </div>

          <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-relaxed text-muted">
            {game.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <RatingStars value={game.rating} size="md" showValue />
              <span className="text-muted">({game.ratingCount.toLocaleString("es-ES")})</span>
            </span>
            <span className="text-muted">{game.developer}</span>
            <time dateTime={game.releaseDate} className="text-muted">
              {formatDate(game.releaseDate, "long")}
            </time>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {platforms.map((platform) => (
              <span
                key={platform.slug}
                className="rounded-input border border-border bg-surface px-2 py-1 text-xs font-bold text-foreground"
              >
                {platform.shortName}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#descargas"
              className="inline-flex items-center gap-2 rounded-card bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent-2"
            >
              <Play className="size-4 fill-current" aria-hidden />
              Jugar ahora
            </a>
            <a
              href="#descargas"
              className="inline-flex items-center gap-2 rounded-card border border-border bg-surface/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-accent/50"
            >
              <Download className="size-4" aria-hidden />
              Descargar
            </a>
            {trailer && (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center gap-2 rounded-card border border-border bg-surface/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-accent/50"
              >
                <Clapperboard className="size-4" aria-hidden />
                Ver tráiler
              </button>
            )}
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={favoritePending}
              aria-pressed={favorite}
              aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              className={cn(
                "flex size-11 items-center justify-center rounded-card border border-border bg-surface/80 backdrop-blur transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                favorite
                  ? "border-accent/50 text-accent"
                  : "text-muted hover:border-accent/50 hover:text-accent",
              )}
            >
              <Heart className={cn("size-5", favorite && "fill-current")} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Compartir"
              onClick={() =>
                toast({
                  title: "Enlace copiado",
                  description: "Comparte con tus amigos.",
                  variant: "info",
                })
              }
              className="flex size-11 items-center justify-center rounded-card border border-border bg-surface/80 text-muted backdrop-blur transition-colors hover:border-accent/50 hover:text-accent"
            >
              <Share2 className="size-5" aria-hidden />
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
