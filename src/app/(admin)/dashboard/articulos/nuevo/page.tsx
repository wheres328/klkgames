import { listTags } from "@/server/services/adminService";
import { listPublishedGames } from "@/server/services/gameService";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function AdminNewArticlePage() {
  const [currentUser, games, tags] = await Promise.all([
    getCurrentUser(),
    listPublishedGames(),
    listTags(),
  ]);

  const authorId = currentUser?.id ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Nuevo artículo"
        description="Escribe un artículo editorial. Se guardará como borrador salvo que elijas publicarlo."
      />
      <ArticleForm
        games={games.map((game) => ({ id: game.id, name: game.name }))}
        tags={tags}
        authorId={authorId}
        submitLabel="Crear artículo"
      />
    </div>
  );
}
