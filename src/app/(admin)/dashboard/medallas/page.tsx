import Image from "next/image";
import Link from "next/link";
import { getBadgeById, listBadgesAdmin } from "@/server/services/badgeService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BadgeForm } from "@/components/admin/BadgeForm";
import { BadgeDeleteButton } from "@/components/admin/BadgeDeleteButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdminBadgesPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function AdminBadgesPage({ searchParams }: AdminBadgesPageProps) {
  const { edit } = await searchParams;
  const [badges, editing] = await Promise.all([
    listBadgesAdmin(),
    edit ? getBadgeById(edit) : Promise.resolve(null),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Medallas"
        description={`${badges.length} medalla(s) definidas para la comunidad.`}
        action={
          editing ? (
            <Link href="/dashboard/medallas">
              <Button variant="secondary" size="sm">
                Cancelar edición
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="order-2 min-w-0 lg:order-1">
          {badges.length === 0 ? (
            <EmptyState
              title="No hay medallas"
              description="Crea la primera medalla para poder otorgarla a los usuarios."
            />
          ) : (
            <div className="overflow-x-auto rounded-card border border-border bg-surface">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs text-muted">
                    <th className="px-4 py-2.5 font-semibold">Medalla</th>
                    <th className="px-4 py-2.5 font-semibold">Slug</th>
                    <th className="px-4 py-2.5 font-semibold">Otorgada</th>
                    <th className="px-4 py-2.5 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {badges.map((badge) => (
                    <tr key={badge.id} className="border-b border-border/40 last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="relative size-9 shrink-0 overflow-hidden rounded-input border border-border bg-surface-raised">
                            <Image
                              src={badge.image}
                              alt={badge.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-foreground">
                              {badge.name}
                            </span>
                            {badge.description ? (
                              <span className="block truncate text-xs text-muted">
                                {badge.description}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{badge.slug}</td>
                      <td className="px-4 py-3 text-muted">{badge.awardedCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/medallas?edit=${badge.id}`}
                            className="text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                          >
                            Editar
                          </Link>
                          <BadgeDeleteButton id={badge.id} name={badge.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="order-1 self-start rounded-card border border-border bg-surface p-5 lg:order-2">
          <h2 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
            {editing ? `Editar "${editing.name}"` : "Nueva medalla"}
          </h2>
          <BadgeForm
            initial={editing ?? undefined}
            submitLabel={editing ? "Guardar cambios" : "Crear medalla"}
          />
        </div>
      </div>
    </div>
  );
}
