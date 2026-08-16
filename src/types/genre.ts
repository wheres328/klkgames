import type { GenrePatternStyle } from "@/lib/genre-art";

export interface Genre {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  description: string;
  accentFrom: string;
  accentTo: string;
  patternStyle?: GenrePatternStyle | null;
  patternSeed?: number | null;
  gameCount: number;
}

export interface GenreRef {
  slug: string;
  name: string;
}
