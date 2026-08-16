import type { Game } from "@/types/game";
import { GameRow } from "@/components/cards/GameRow";
import { cn } from "@/lib/utils";

export interface GameRowListProps {
  games: Game[];
  rank?: boolean;
  showDate?: boolean;
  showDescription?: boolean;
  withHeader?: boolean;
  startRank?: number;
  className?: string;
}

// Lista compacta de juegos en formato tabla (Formato A): filas planas dentro de
// un contenedor con borde. Usada en Home, /games, géneros, búsqueda y similares.
export function GameRowList({
  games,
  rank = false,
  showDate = true,
  showDescription = false,
  withHeader = false,
  startRank = 1,
  className,
}: GameRowListProps) {
  if (games.length === 0) return null;

  return (
    <div
      className={cn("overflow-hidden rounded-card border border-border bg-surface/40", className)}
    >
      {withHeader && (
        <div
          aria-hidden
          className="hidden items-center gap-3 border-b border-border/60 bg-surface/60 px-3 py-2 text-[10px] font-semibold tracking-wider text-muted uppercase sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
        >
          {rank ? <span className="w-6 text-right">#</span> : null}
          <span>Juego</span>
          <span>Valoración</span>
        </div>
      )}
      {games.map((game, index) => (
        <GameRow
          key={game.id}
          game={game}
          variant="flat"
          rank={rank ? startRank + index : undefined}
          showDate={showDate}
          showDescription={showDescription}
        />
      ))}
    </div>
  );
}
