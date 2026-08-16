import Link from "next/link";
import { Filter, Plus } from "lucide-react";
import { listArticlesAdmin } from "@/server/services/adminService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ArticleActions } from "@/components/admin/ArticleActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PUBLISH_STATUS_LABELS, publishStatusTone } from "@/components/admin/constants";

interface AdminArticlesPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const status = params.status || undefined;
  const page = Number.parseInt(params.page ?? "1", 10) || 1;

  const result = await listArticlesAdmin({ q, status, page, pageSize: 20 });
  const filterParams: Record<string, string | undefined> = { q, status };

  return (
    <div>
      <AdminPageHeader
        title="Artículos"
        description={`${result.total} artículo(s) en total.`}
        action={
          <Link href="/dashboard/articulos/nuevo">
            <Button size="sm">
              <Plus className="size-4" aria-hidden />
              Nuevo artículo
            </Button>
          </Link>
        }
      />

      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface p-3"
      >
        <div className="min-w-52 flex-1">
          <label htmlFor="article-search" className="mb-1.5 block text-xs font-medium text-muted">
            Buscar por título
          </label>
          <input
            id="article-search"
            name="q"
            defaultValue={q}
            placeholder="Ej. mejores juegos"
            className="h-9 w-full rounded-input border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div>
          <label htmlFor="article-status" className="mb-1.5 block text-xs font-medium text-muted">
            Estado
          </label>
          <select
            id="article-status"
            name="status"
            defaultValue={status}
            className="h-9 rounded-input border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Todos</option>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </div>
        <Button type="submit" variant="secondary" size="sm" className="h-9">
          <Filter className="size-4" aria-hidden />
          Filtrar
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="No hay artículos"
          description={
            q || status
              ? "Ningún artículo coincide con los filtros."
              : "Crea tu primer artículo editorial."
          }
          action={
            !q && !status ? (
              <Link href="/dashboard/articulos/nuevo">
                <Button size="sm">
                  <Plus className="size-4" aria-hidden />
                  Nuevo artículo
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted">
                <th className="px-4 py-2.5 font-semibold">Artículo</th>
                <th className="px-4 py-2.5 font-semibold">Categoría</th>
                <th className="px-4 py-2.5 font-semibold">Autor</th>
                <th className="px-4 py-2.5 font-semibold">Estado</th>
                <th className="px-4 py-2.5 font-semibold">Comentarios</th>
                <th className="px-4 py-2.5 font-semibold">Publicado</th>
                <th className="px-4 py-2.5 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((article) => (
                <tr key={article.id} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/articulos/${article.id}/editar`}
                      className="line-clamp-2 font-semibold text-foreground transition-colors hover:text-accent"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-muted">
                      {article.readTime} min de lectura · {article.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted">{article.category}</td>
                  <td className="px-4 py-3 text-muted">@{article.author}</td>
                  <td className="px-4 py-3">
                    <Badge variant={publishStatusTone(article.status)}>
                      {PUBLISH_STATUS_LABELS[article.status] ?? article.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{article.commentCount}</td>
                  <td className="px-4 py-3 text-muted">
                    {article.publishedAt.toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <Link
                        href={`/dashboard/articulos/${article.id}/editar`}
                        className="text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                      >
                        Editar
                      </Link>
                      <ArticleActions id={article.id} status={article.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination
        basePath="/dashboard/articulos"
        page={result.currentPage}
        totalPages={result.totalPages}
        params={filterParams}
      />
    </div>
  );
}
