import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types/game";
import { cn } from "@/lib/utils";

export interface RecommendationCardProps {
  game: Game;
  className?: string;
}

export function RecommendationCard({ game, className }: RecommendationCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(
        "group flex items-center gap-3 rounded-card border border-border bg-surface p-3 transition-all duration-200 hover:border-accent/50 hover:bg-surface-raised",
        className,
      )}
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-card">
        <Image
          src={game.cover}
          alt={game.name}
          fill
          sizes="56px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
          {game.name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted">
          {game.genreNames?.[0]?.name ?? game.genres[0]} ·{" "}
          {game.platformNames?.[0]?.name ?? game.platforms[0]}
        </p>
      </div>
      <span className="shrink-0 rounded-input bg-accent/10 px-2 py-1 text-sm font-bold text-accent">
        {game.rating}
      </span>
    </Link>
  );
}
