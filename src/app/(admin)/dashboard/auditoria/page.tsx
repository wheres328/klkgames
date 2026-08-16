import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { listAuditLogsAdmin } from "@/server/services/adminService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AUDIT_ACTION_LABELS } from "@/components/admin/constants";

interface AdminAuditPageProps {
  searchParams: Promise<{ page?: string; entity?: string; action?: string }>;
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10) || 1;
  const entity = params.entity || undefined;
  const action = params.action || undefined;

  const result = await listAuditLogsAdmin({ page, pageSize: 30, entityType: entity, action });
  const filterParams: Record<string, string | undefined> = { entity, action };

  const entityOptions = [
    "User",
    "Game",
    "Article",
    "Genre",
    "Platform",
    "Comment",
    "Rating",
    "Favorite",
    "Report",
  ];

  return (
    <div>
      <AdminPageHeader
        title="Auditoría"
        description={`${result.total} registro(s) de actividad administrativa.`}
      />

      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface p-3"
      >
        <div>
          <label htmlFor="audit-entity" className="mb-1.5 block text-xs font-medium text-muted">
            Entidad
          </label>
          <select
            id="audit-entity"
            name="entity"
            defaultValue={entity}
            className="h-9 rounded-input border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Todas</option>
            {entityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="audit-action" className="mb-1.5 block text-xs font-medium text-muted">
            Acción
          </label>
          <select
            id="audit-action"
            name="action"
            defaultValue={action}
            className="h-9 rounded-input border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Todas</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-input border border-border bg-surface px-3 text-sm font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          Filtrar
        </button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="Sin registros"
          description="No hay actividad registrada con estos filtros."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted">
                <th className="px-4 py-2.5 font-semibold">Acción</th>
                <th className="px-4 py-2.5 font-semibold">Entidad</th>
                <th className="px-4 py-2.5 font-semibold">Actor</th>
                <th className="px-4 py-2.5 font-semibold">Detalle</th>
                <th className="px-4 py-2.5 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((log) => (
                <tr key={log.id} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {log.entityType}
                    <span className="text-muted/60"> · {log.entityId}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {log.actor ? (
                      <Link
                        href={`/dashboard/usuarios?q=${encodeURIComponent(log.actor.name)}`}
                        className="font-medium text-accent transition-colors hover:text-accent-2"
                      >
                        {log.actor.name}
                      </Link>
                    ) : (
                      <Badge variant="neutral">sistema</Badge>
                    )}
                  </td>
                  <td className="max-w-72 px-4 py-3">
                    {log.before || log.after ? (
                      <details className="text-xs text-muted">
                        <summary className="cursor-pointer font-medium text-accent transition-colors hover:text-accent-2">
                          Ver cambios
                        </summary>
                        <pre className="mt-2 max-h-40 overflow-auto rounded-input bg-background p-2 text-[11px]">
                          {JSON.stringify({ before: log.before, after: log.after }, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-muted/60">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{log.createdAt.toLocaleString("es-ES")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination
        basePath="/dashboard/auditoria"
        page={result.currentPage}
        totalPages={result.totalPages}
        params={filterParams}
      />
    </div>
  );
}
