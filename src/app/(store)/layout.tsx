import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { MobileNav } from "@/components/layout/MobileNav";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { getGlobalSuggestions } from "@/server/services/suggestionService";
import { listPublishedGames } from "@/server/services/gameService";
import { listGenres } from "@/server/services/genreService";
import { getSiteSettings, listVisibleSocialLinks } from "@/server/services/siteSettingsService";
import type { UserSummary } from "@/types/user";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [currentUser, suggestions, games, genres, settings, socialLinks] = await Promise.all([
    getCurrentUser(),
    getGlobalSuggestions(),
    listPublishedGames(),
    listGenres(),
    getSiteSettings(),
    listVisibleSocialLinks(),
  ]);

  const user: UserSummary | null = currentUser
    ? {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.image ?? "",
      }
    : null;

  return (
    <>
      <Navbar suggestions={suggestions} currentUser={user} settings={settings} />
      <main className="flex-1">{children}</main>
      <StoreFooter games={games} genres={genres} settings={settings} socialLinks={socialLinks} />
      <MobileNav />
    </>
  );
}
