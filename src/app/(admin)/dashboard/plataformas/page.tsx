import Link from "next/link";
import { getPlatformById, listPlatforms } from "@/server/services/platformService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PlatformForm } from "@/components/admin/PlatformForm";
import { PlatformDeleteButton } from "@/components/admin/PlatformDeleteButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdminPlatformsPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function AdminPlatformsPage({ searchParams }: AdminPlatformsPageProps) {
  const { edit } = await searchParams;
  const [platforms, editing] = await Promise.all([
    listPlatforms(),
    edit ? getPlatformById(edit) : Promise.resolve(null),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Plataformas"
        description={`${platforms.length} plataforma(s) en total.`}
        action={
          editing ? (
            <Link href="/dashboard/plataformas">
              <Button variant="secondary" size="sm">
                Cancelar edición
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 min-w-0 lg:order-1">
          {platforms.length === 0 ? (
            <EmptyState
              title="No hay plataformas"
              description="Crea la primera plataforma del catálogo."
            />
          ) : (
            <div className="overflow-x-auto rounded-card border border-border bg-surface">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs text-muted">
                    <th className="px-4 py-2.5 font-semibold">Plataforma</th>
                    <th className="px-4 py-2.5 font-semibold">Slug</th>
                    <th className="px-4 py-2.5 font-semibold">Nombre corto</th>
                    <th className="px-4 py-2.5 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((platform) => (
                    <tr key={platform.id} className="border-b border-border/40 last:border-b-0">
                      <td className="px-4 py-3 font-semibold text-foreground">{platform.name}</td>
                      <td className="px-4 py-3 text-muted">{platform.slug}</td>
                      <td className="px-4 py-3 text-muted">{platform.shortName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/plataformas?edit=${platform.id}`}
                            className="text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                          >
                            Editar
                          </Link>
                          <PlatformDeleteButton id={platform.id} name={platform.name} />
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
            {editing ? `Editar "${editing.name}"` : "Nueva plataforma"}
          </h2>
          <PlatformForm
            initial={editing ?? undefined}
            submitLabel={editing ? "Guardar cambios" : "Crear plataforma"}
          />
        </div>
      </div>
    </div>
  );
}
