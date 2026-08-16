import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, Heart } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { GameCard } from "@/components/cards/GameCard";
import { siteConfig } from "@/config/site";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { getUserFavorites } from "@/server/services/favoriteService";

export const metadata: Metadata = {
  title: "Favoritos",
  description: `Tus juegos favoritos de ${siteConfig.name} en un solo lugar.`,
};

async function FavoritesGrid({ userId }: { userId: string }) {
  const favorites = await getUserFavorites(userId);

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Todavía no tienes favoritos"
        description="Explora el catálogo y guarda los juegos que te interesen."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/favorites");
  }

  return (
    <div className="py-10">
      <Container className="max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Mi colección</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Favoritos
        </h1>

        <div className="mt-8">
          <FavoritesGrid userId={user.id} />
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
          >
            <Compass className="size-4" aria-hidden />
            Explorar juegos
          </Link>
        </div>
      </Container>
    </div>
  );
}
