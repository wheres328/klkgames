import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Game } from "@/types/game";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatCount, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface GameRowProps {
  game: Game;
  rank?: number;
  className?: string;
  showDescription?: boolean;
  showDate?: boolean;
  variant?: "card" | "flat";
}

// Fila compacta de juego (Formato A): miniatura + nombre + géneros + plataformas +
// rating + chevron. Para Home, /games, búsqueda, géneros y similares.
// `variant="flat"` elimina el borde/radio para usarse dentro de listas tipo tabla.
export function GameRow({
  game,
  rank,
  className,
  showDescription = false,
  showDate = true,
  variant = "card",
}: GameRowProps) {
  const container = cn(
    "group grid items-center gap-3 px-3 py-2 transition-all duration-200",
    rank !== undefined
      ? "grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto]"
      : "grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]",
    variant === "card"
      ? "rounded-card border border-border bg-surface hover:border-accent/40 hover:bg-surface-raised"
      : "border-b border-border/60 bg-transparent last:border-0 hover:bg-surface-raised/60",
    className,
  );

  return (
    <Link href={`/games/${game.slug}`} className={container}>
      {rank !== undefined && (
        <span className="w-6 shrink-0 text-right font-display text-sm font-bold text-muted/70 tabular-nums">
          {rank}
        </span>
      )}

      <div className="relative h-11 w-[74px] shrink-0 overflow-hidden rounded-input border border-border sm:h-12 sm:w-20">
        <Image
          src={game.cover}
          alt={game.name}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-accent-2">
          {game.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {(game.genreNames ?? [])
            .slice(0, 2)
            .map((genre) => genre.name)
            .join(" · ")}
          {showDate && <span aria-hidden> · </span>}
          {showDate && <time dateTime={game.releaseDate}>{formatDate(game.releaseDate)}</time>}
        </p>
        {showDescription && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{game.description}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {(game.platformNames ?? []).slice(0, 4).map((platform) => (
            <span
              key={platform.slug}
              className="rounded-input border border-border bg-surface-raised px-1 py-px text-[9px] font-bold text-muted"
            >
              {platform.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted">
        <RatingStars value={game.rating} size="sm" />
        <span className="hidden font-semibold text-foreground tabular-nums sm:inline">
          {game.rating.toFixed(1)}
        </span>
        <span className="hidden lg:inline">({formatCount(game.ratingCount)})</span>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <ChevronRight
          className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </div>
    </Link>
  );
}
