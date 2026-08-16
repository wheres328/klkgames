import { ShieldCheck } from "lucide-react";
import { listRanks } from "@/server/services/rankService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RankEditor } from "@/components/admin/RankEditor";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PERMISSION_LABELS } from "@/server/services/permissionService";

export default async function AdminRanksPage() {
  const ranks = await listRanks();

  return (
    <div>
      <AdminPageHeader
        title="Rangos"
        description="Crea rangos personalizados con permisos para lo que cada miembro puede hacer en el sitio."
      />

      <section className="mb-6">
        <h2 className="font-display mb-3 text-sm font-bold tracking-tight text-foreground">
          Nuevo rango
        </h2>
        <RankEditor />
      </section>

      <section>
        <h2 className="font-display mb-3 text-sm font-bold tracking-tight text-foreground">
          Rangos existentes ({ranks.length})
        </h2>
        {ranks.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Sin rangos todavía"
            description="Crea tu primer rango para organizar los permisos de la comunidad."
          />
        ) : (
          <div className="space-y-4">
            {ranks.map((rank) => (
              <div key={rank.id} className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  {rank.isDefault ? <Badge variant="neutral">Por defecto</Badge> : null}
                  <span
                    className="inline-flex items-center gap-1.5 rounded-input border border-border bg-surface-raised px-2 py-0.5 text-sm font-semibold text-foreground"
                    style={rank.color ? { color: rank.color } : undefined}
                  >
                    <ShieldCheck className="size-3.5" aria-hidden />
                    {rank.name}
                  </span>
                  <span>{rank.userCount} usuario(s)</span>
                  {rank.permissions.length > 0 ? (
                    <span className="ml-auto hidden max-w-md truncate lg:block">
                      {rank.permissions.map((code) => PERMISSION_LABELS[code] ?? code).join(", ")}
                    </span>
                  ) : (
                    <span className="ml-auto hidden lg:block">Sin permisos</span>
                  )}
                </div>
                <RankEditor rank={rank} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
