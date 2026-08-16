import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Game } from "@/types/game";
import { Tag } from "@/components/ui/Tag";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface FeaturedGameCardProps {
  game: Game;
  className?: string;
}

export function FeaturedGameCard({ game, className }: FeaturedGameCardProps) {
  const genres = (game.genreNames ?? []).slice(0, 3);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-card border border-border bg-surface",
        className,
      )}
    >
      <Image
        src={game.cover}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 70vw"
        className="object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="relative flex min-h-[420px] flex-col justify-end p-6 sm:p-10 lg:min-h-[460px]">
        <div className="flex flex-wrap items-center gap-2">
          {genres.map((genre) => (
            <Tag key={genre.slug}>{genre.name}</Tag>
          ))}
        </div>

        <h3 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {game.name}
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
          {game.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <RatingStars value={game.rating} size="md" />
            <span className="font-semibold text-foreground">{game.rating}</span>
            <span className="text-xs text-muted">({game.ratingCount.toLocaleString("es-ES")})</span>
          </span>
          <span className="text-sm text-muted">{formatDate(game.releaseDate)}</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/games/${game.slug}`}
            className="inline-flex items-center gap-2 rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent-2 hover:shadow-accent/40"
          >
            <Play className="size-4 fill-current" aria-hidden />
            Jugar ahora
          </Link>
        </div>
      </div>
    </article>
  );
}
