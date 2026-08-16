import Link from "next/link";
import { Filter, Plus } from "lucide-react";
import { listGamesAdmin } from "@/server/services/adminService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { GameActions } from "@/components/admin/GameActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  GAME_STATUS_LABELS,
  PUBLISH_STATUS_LABELS,
  publishStatusTone,
} from "@/components/admin/constants";

interface AdminGamesPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminGamesPage({ searchParams }: AdminGamesPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const status = params.status || undefined;
  const page = Number.parseInt(params.page ?? "1", 10) || 1;

  const result = await listGamesAdmin({ q, publishStatus: status, page, pageSize: 20 });

  const filterParams: Record<string, string | undefined> = { q, status };

  return (
    <div>
      <AdminPageHeader
        title="Juegos"
        description={`${result.total} juego(s) en total.`}
        action={
          <Link href="/dashboard/juegos/nuevo">
            <Button size="sm">
              <Plus className="size-4" aria-hidden />
              Nuevo juego
            </Button>
          </Link>
        }
      />

      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface p-3"
      >
        <div className="min-w-52 flex-1">
          <label htmlFor="game-search" className="mb-1.5 block text-xs font-medium text-muted">
            Buscar por nombre o desarrollador
          </label>
          <input
            id="game-search"
            name="q"
            defaultValue={q}
            placeholder="Ej. War Thunder"
            className="h-9 w-full rounded-input border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div>
          <label htmlFor="game-status" className="mb-1.5 block text-xs font-medium text-muted">
            Estado editorial
          </label>
          <select
            id="game-status"
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
          title="No hay juegos"
          description={
            q || status
              ? "Ningún juego coincide con los filtros."
              : "Crea tu primer juego para empezar a construir el catálogo."
          }
          action={
            !q && !status ? (
              <Link href="/dashboard/juegos/nuevo">
                <Button size="sm">
                  <Plus className="size-4" aria-hidden />
                  Nuevo juego
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted">
                <th className="px-4 py-2.5 font-semibold">Juego</th>
                <th className="px-4 py-2.5 font-semibold">Géneros</th>
                <th className="px-4 py-2.5 font-semibold">Estado</th>
                <th className="px-4 py-2.5 font-semibold">Valoración</th>
                <th className="px-4 py-2.5 font-semibold">Comentarios</th>
                <th className="px-4 py-2.5 font-semibold">Publicado</th>
                <th className="px-4 py-2.5 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((game) => (
                <tr key={game.id} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {game.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={game.cover}
                          alt=""
                          className="size-12 shrink-0 rounded-input border border-border bg-background object-cover"
                        />
                      ) : (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-input border border-border bg-background text-xs text-muted">
                          Sin portada
                        </span>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/juegos/${game.id}/editar`}
                          className="block truncate font-semibold text-foreground transition-colors hover:text-accent"
                        >
                          {game.name}
                        </Link>
                        <p className="truncate text-xs text-muted">
                          {GAME_STATUS_LABELS[game.status] ?? game.status}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-40 truncate text-xs text-muted">
                      {game.genres.join(", ") || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={publishStatusTone(game.publishStatus)}>
                      {PUBLISH_STATUS_LABELS[game.publishStatus] ?? game.publishStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {game.rating.toFixed(1)} ({game.ratingCount})
                  </td>
                  <td className="px-4 py-3 text-muted">{game.commentCount}</td>
                  <td className="px-4 py-3 text-muted">
                    {game.publishedAt ? game.publishedAt.toLocaleDateString("es-ES") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <Link
                        href={`/dashboard/juegos/${game.id}/editar`}
                        className="text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                      >
                        Editar
                      </Link>
                      <GameActions id={game.id} publishStatus={game.publishStatus} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination
        basePath="/dashboard/juegos"
        page={result.currentPage}
        totalPages={result.totalPages}
        params={filterParams}
      />
    </div>
  );
}
