import { listGenres } from "@/server/services/genreService";
import { listPlatforms } from "@/server/services/platformService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GameForm } from "@/components/admin/GameForm";

export default async function AdminNewGamePage() {
  const [genres, platforms] = await Promise.all([listGenres(), listPlatforms()]);

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Nuevo juego"
        description="Nombre, descripción, fotos, especificaciones, enlaces de descarga y un vídeo. Se creará como borrador salvo que marques publicar."
      />
      <GameForm
        genres={genres.map((genre) => ({ id: genre.id, name: genre.name }))}
        platforms={platforms.map((platform) => ({ id: platform.id, name: platform.shortName }))}
        submitLabel="Crear juego"
      />
    </div>
  );
}
