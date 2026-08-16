import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { TrendingSection } from "@/components/home/TrendingSection";
import { PopularSection } from "@/components/home/PopularSection";
import { EditorPicksSection } from "@/components/home/EditorPicksSection";
import { NewReleasesSection } from "@/components/home/NewReleasesSection";
import { GenreSection } from "@/components/home/GenreSection";
import { UpcomingSection } from "@/components/home/UpcomingSection";
import { ArticlesSection } from "@/components/home/ArticlesSection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { DonateSection } from "@/components/home/DonateSection";
import {
  getFeaturedGame,
  getTrendingGames,
  getEditorPicks,
  getMostPopularGames,
  getTopRatedGames,
  getNewReleases,
  getUpcomingGames,
  getEarlyAccessGames,
} from "@/server/services/gameService";
import { listGenres } from "@/server/services/genreService";
import { listPublishedArticles } from "@/server/services/articleService";
import { getCommunityMembers } from "@/server/services/userService";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Descubre videojuegos, consulta requisitos, lee artículos y forma parte de una comunidad de jugadores.",
};

export default async function Home() {
  const [
    featuredGame,
    trending,
    editorPicks,
    mostPopular,
    topRated,
    newReleases,
    upcoming,
    earlyAccess,
    genres,
    articles,
    members,
  ] = await Promise.all([
    getFeaturedGame(),
    getTrendingGames(8),
    getEditorPicks(6),
    getMostPopularGames(5),
    getTopRatedGames(5),
    getNewReleases(8),
    getUpcomingGames(1),
    getEarlyAccessGames(4),
    listGenres(),
    listPublishedArticles(5),
    getCommunityMembers(4),
  ]);

  const featured = featuredGame ?? editorPicks[0] ?? null;

  return (
    <>
      <HomeHero game={featured} genres={featured?.genreNames ?? []} />
      <TrendingSection games={trending} />
      <EditorPicksSection featured={editorPicks[0]} rest={editorPicks.slice(1, 6)} />
      <PopularSection mostPopular={mostPopular} topRated={topRated} />
      <NewReleasesSection games={newReleases} />
      <GenreSection genres={genres} />
      <UpcomingSection main={upcoming[0] ?? null} earlyAccess={earlyAccess} />
      <ArticlesSection featured={articles[0]} rest={articles.slice(1, 5)} />
      <DonateSection />
      <CommunitySection members={members} />
    </>
  );
}
