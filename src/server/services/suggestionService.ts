import { db } from "@/lib/db";
import type { SearchSuggestion } from "@/types/search";

const PUBLISHED = "PUBLISHED";

interface SuggestionGameRow {
  slug: string;
  name: string;
  genres: Array<{ slug: string; name: string }>;
  images: Array<{ url: string }>;
}

interface SuggestionGenreRow {
  slug: string;
  name: string;
  image: string;
  gameCount: number;
}

interface SuggestionArticleRow {
  slug: string;
  title: string;
  category: string;
  image: string;
}

interface SuggestionPlatformRow {
  slug: string;
  name: string;
  shortName: string;
}

function buildSuggestions(
  gameRows: SuggestionGameRow[],
  genreRows: SuggestionGenreRow[],
  articleRows: SuggestionArticleRow[],
  platformRows: SuggestionPlatformRow[],
  limit: number,
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [
    ...gameRows.map((game) => ({
      id: `game-${game.slug}`,
      label: game.name,
      description: game.genres
        .map((genre) => genre.name)
        .slice(0, 2)
        .join(" · "),
      href: `/games/${game.slug}`,
      image: game.images[0]?.url ?? "",
      category: "juego" as const,
    })),
    ...genreRows.map((genre) => ({
      id: `genre-${genre.slug}`,
      label: genre.name,
      description: `${genre.gameCount.toLocaleString("es-ES")} juegos`,
      href: `/genres/${genre.slug}`,
      image: genre.image ?? "",
      category: "genero" as const,
    })),
    ...platformRows.map((platform) => ({
      id: `platform-${platform.slug}`,
      label: platform.name,
      description: platform.shortName,
      href: `/games?platform=${platform.slug}`,
      category: "plataforma" as const,
    })),
    ...articleRows.map((article) => ({
      id: `article-${article.slug}`,
      label: article.title,
      description: article.category,
      href: `/articles/${article.slug}`,
      image: article.image,
      category: "articulo" as const,
    })),
  ];

  return suggestions.slice(0, limit);
}

// Sugerencias por defecto de la barra de búsqueda (sin término).
export async function getGlobalSuggestions(limit = 8): Promise<SearchSuggestion[]> {
  const [gameRows, genreRows, articleRows, platformRows] = await Promise.all([
    db.game.findMany({
      where: { publishStatus: PUBLISHED },
      orderBy: [{ ratingCount: "desc" }],
      take: 4,
      select: {
        slug: true,
        name: true,
        genres: { take: 2, select: { slug: true, name: true } },
        images: { where: { type: "COVER" }, take: 1, select: { url: true } },
      },
    }),
    db.genre.findMany({
      orderBy: [{ name: "asc" }],
      take: 2,
      select: { slug: true, name: true, image: true, gameCount: true },
    }),
    db.article.findMany({
      where: { status: PUBLISHED },
      orderBy: [{ publishedAt: "desc" }],
      take: 2,
      select: { slug: true, title: true, category: true, image: true },
    }),
    db.platform.findMany({
      orderBy: [{ name: "asc" }],
      take: 2,
      select: { slug: true, name: true, shortName: true },
    }),
  ]);

  return buildSuggestions(
    gameRows as unknown as SuggestionGameRow[],
    genreRows as unknown as SuggestionGenreRow[],
    articleRows as unknown as SuggestionArticleRow[],
    platformRows as unknown as SuggestionPlatformRow[],
    limit,
  );
}

export async function getSearchSuggestions(q: string, limit = 8): Promise<SearchSuggestion[]> {
  const needle = q.trim();
  if (!needle) return [];

  const [gameRows, genreRows, articleRows, platformRows] = await Promise.all([
    db.game.findMany({
      where: { publishStatus: PUBLISHED, name: { startsWith: needle, mode: "insensitive" } },
      orderBy: [{ ratingCount: "desc" }],
      take: 4,
      select: {
        slug: true,
        name: true,
        genres: { take: 2, select: { slug: true, name: true } },
        images: { where: { type: "COVER" }, take: 1, select: { url: true } },
      },
    }),
    db.genre.findMany({
      where: { name: { contains: needle, mode: "insensitive" } },
      take: 2,
      select: { slug: true, name: true, image: true, gameCount: true },
    }),
    db.article.findMany({
      where: { status: PUBLISHED, title: { contains: needle, mode: "insensitive" } },
      take: 2,
      select: { slug: true, title: true, category: true, image: true },
    }),
    db.platform.findMany({
      where: {
        OR: [
          { name: { contains: needle, mode: "insensitive" } },
          { shortName: { contains: needle, mode: "insensitive" } },
        ],
      },
      take: 2,
      select: { slug: true, name: true, shortName: true },
    }),
  ]);

  return buildSuggestions(
    gameRows as unknown as SuggestionGameRow[],
    genreRows as unknown as SuggestionGenreRow[],
    articleRows as unknown as SuggestionArticleRow[],
    platformRows as unknown as SuggestionPlatformRow[],
    limit,
  );
}
