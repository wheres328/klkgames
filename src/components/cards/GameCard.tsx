import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types/game";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface GameCardProps {
  game: Game;
  className?: string;
  showRating?: boolean;
}

export function GameCard({ game, className, showRating = true }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-black/30",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={game.cover}
          alt={game.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        <span className="absolute bottom-2 left-2 rounded-input bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
          <RatingStars value={game.rating} size="sm" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base leading-snug font-semibold text-foreground transition-colors group-hover:text-accent">
            {game.name}
          </h3>
          <span className="mt-0.5 shrink-0 rounded-input border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] font-bold text-muted">
            {game.platformNames?.[0]?.name ?? game.platforms[0]}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted">{game.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
          <span>{formatDate(game.releaseDate)}</span>
          {showRating && <span className="font-semibold text-foreground">{game.rating}</span>}
        </div>
      </div>
    </Link>
  );
}
