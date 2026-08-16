"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { GameFooter } from "@/components/game-detail/GameFooter";
import type { Game } from "@/types/game";
import type { Genre } from "@/types/genre";
import type { SiteSettings, SocialLinkView } from "@/server/services/siteSettingsService";

export interface StoreFooterProps {
  games: Game[];
  genres: Genre[];
  settings?: SiteSettings;
  socialLinks?: SocialLinkView[];
}

// Elige el footer correcto según la ruta: si estamos en una página de detalle de
// juego (/games/[slug]) renderiza el footer dinámico con el banner; en el resto
// de la tienda usa el footer estándar con catálogo y géneros.
export function StoreFooter({ games, genres, settings, socialLinks }: StoreFooterProps) {
  const pathname = usePathname();
  const match = /^\/games\/([^/]+)$/.exec(pathname);
  const game = match ? games.find((item) => item.slug === match[1]) : undefined;

  if (game) {
    return <GameFooter game={game} settings={settings} socialLinks={socialLinks} />;
  }
  return <Footer games={games} genres={genres} settings={settings} socialLinks={socialLinks} />;
}
