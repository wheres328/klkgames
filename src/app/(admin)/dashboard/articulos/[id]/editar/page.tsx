import { notFound } from "next/navigation";
import { getArticleAdmin, listTags } from "@/server/services/adminService";
import { listPublishedGames } from "@/server/services/gameService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";

interface AdminEditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditArticlePage({ params }: AdminEditArticlePageProps) {
  const { id } = await params;
  const [article, games, tags] = await Promise.all([
    getArticleAdmin(id),
    listPublishedGames(),
    listTags(),
  ]);

  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title={`Editar: ${article.title}`}
        description={`${article.slug} · ${article.status}`}
      />
      <ArticleForm
        games={games.map((game) => ({ id: game.id, name: game.name }))}
        tags={tags}
        authorId={article.authorId}
        initial={article}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
