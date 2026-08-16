import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Flag,
  Gamepad2,
  Heart,
  MessageSquare,
  Monitor,
  Plus,
  Star,
  Tags,
  Users,
} from "lucide-react";
import { getDashboardStats } from "@/server/services/adminService";
import { getSiteSettings } from "@/server/services/siteSettingsService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AUDIT_ACTION_LABELS } from "@/components/admin/constants";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Gamepad2;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-input bg-accent/10 text-accent-2">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="font-display text-lg font-bold text-foreground">{value}</p>
        {sub ? <p className="text-xs text-muted">{sub}</p> : null}
      </div>
    </div>
  );
}

export default async function DashboardOverviewPage() {
  const [stats, settings] = await Promise.all([getDashboardStats(), getSiteSettings()]);

  return (
    <div>
      <AdminPageHeader
        title="Resumen"
        description={`Vista general de la plataforma ${settings.name}.`}
        action={
          <>
            <Link href="/dashboard/juegos/nuevo">
              <Button size="sm">
                <Plus className="size-4" aria-hidden />
                Nuevo juego
              </Button>
            </Link>
            <Link href="/dashboard/articulos/nuevo">
              <Button variant="secondary" size="sm">
                <Plus className="size-4" aria-hidden />
                Nuevo artículo
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Gamepad2}
          label="Juegos"
          value={stats.gameCount}
          sub={`${stats.publishedGameCount} publicados`}
        />
        <StatCard
          icon={FileText}
          label="Artículos"
          value={stats.articleCount}
          sub={`${stats.publishedArticleCount} publicados`}
        />
        <StatCard icon={Users} label="Usuarios" value={stats.userCount} />
        <StatCard icon={MessageSquare} label="Comentarios" value={stats.commentCount} />
        <StatCard icon={Star} label="Valoraciones" value={stats.ratingCount} />
        <StatCard icon={Heart} label="Favoritos" value={stats.favoriteCount} />
        <StatCard icon={Tags} label="Géneros" value={stats.genreCount} />
        <StatCard
          icon={Monitor}
          label="Plataformas"
          value={stats.platformCount}
          sub={
            stats.reportPendingCount > 0
              ? `${stats.reportPendingCount} reporte(s) pendiente(s)`
              : undefined
          }
        />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold tracking-tight text-foreground">
            Actividad reciente
          </h2>
          <Link
            href="/dashboard/auditoria"
            className="text-xs font-semibold text-accent transition-colors hover:text-accent-2"
          >
            Ver toda la auditoría
          </Link>
        </div>

        {stats.recentAudit.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="Sin actividad todavía"
            description="Las acciones administrativas quedarán registradas aquí."
          />
        ) : (
          <div className="overflow-x-auto rounded-card border border-border bg-surface">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs text-muted">
                  <th className="px-4 py-2.5 font-semibold">Acción</th>
                  <th className="px-4 py-2.5 font-semibold">Entidad</th>
                  <th className="px-4 py-2.5 font-semibold">Actor</th>
                  <th className="px-4 py-2.5 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAudit.map((log) => (
                  <tr key={log.id} className="border-b border-border/40 last:border-b-0">
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {log.entityType}
                      <span className="text-muted/60"> · {log.entityId}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {log.actor ? log.actor.name : <Badge variant="neutral">sistema</Badge>}
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {log.createdAt.toLocaleString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-5">
          <h2 className="font-display mb-2 text-sm font-bold tracking-tight text-foreground">
            Atajos
          </h2>
          <ul className="space-y-1 text-sm">
            {[
              { href: "/dashboard/juegos", label: "Gestionar juegos" },
              { href: "/dashboard/articulos", label: "Gestionar artículos" },
              { href: "/dashboard/generos", label: "Gestionar géneros" },
              { href: "/dashboard/plataformas", label: "Gestionar plataformas" },
              { href: "/dashboard/usuarios", label: "Gestionar usuarios" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-muted transition-colors hover:text-accent"
                >
                  <ClipboardList className="size-4" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
