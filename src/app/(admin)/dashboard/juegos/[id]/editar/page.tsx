import { notFound } from "next/navigation";
import { getGameAdmin } from "@/server/services/adminService";
import { listGenres } from "@/server/services/genreService";
import { listPlatforms } from "@/server/services/platformService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GameForm } from "@/components/admin/GameForm";

interface AdminEditGamePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditGamePage({ params }: AdminEditGamePageProps) {
  const { id } = await params;
  const [game, genres, platforms] = await Promise.all([
    getGameAdmin(id),
    listGenres(),
    listPlatforms(),
  ]);

  if (!game) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title={`Editar: ${game.name}`}
        description={`${game.slug} · ${game.publishStatus}`}
      />
      <GameForm
        genres={genres.map((genre) => ({ id: genre.id, name: genre.name }))}
        platforms={platforms.map((platform) => ({ id: platform.id, name: platform.shortName }))}
        initial={game}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
