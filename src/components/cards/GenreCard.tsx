import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Genre } from "@/types/genre";
import { resolveGenrePattern } from "@/lib/genre-art";
import { GenreArt } from "@/components/ui/GenreArt";
import { cn } from "@/lib/utils";

export interface GenreCardProps {
  genre: Genre;
  className?: string;
}

export function GenreCard({ genre, className }: GenreCardProps) {
  const pattern = resolveGenrePattern(genre);

  return (
    <Link
      href={`/genres/${genre.slug}`}
      className={cn(
        "group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-black/30",
        className,
      )}
    >
      {genre.image ? (
        <Image
          src={genre.image}
          alt={genre.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <GenreArt
          style={pattern.style}
          seed={pattern.seed}
          accentFrom={genre.accentFrom}
          accentTo={genre.accentTo}
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

      <div className="relative flex items-end justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-white">{genre.name}</h3>
          <p className="text-xs text-white/70">{genre.gameCount.toLocaleString("es-ES")} juegos</p>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-input bg-white/10 text-white backdrop-blur-sm transition-colors group-hover:bg-accent">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
