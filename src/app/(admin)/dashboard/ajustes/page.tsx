import Link from "next/link";
import { getSiteSettings, listSocialLinks } from "@/server/services/siteSettingsService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { SocialLinkForm } from "@/components/admin/SocialLinkForm";
import { SocialLinkDeleteButton } from "@/components/admin/SocialLinkDeleteButton";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminSettingsPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  const { edit } = await searchParams;
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), listSocialLinks()]);
  const editing = edit ? socialLinks.find((link) => link.id === edit) : undefined;

  return (
    <div>
      <AdminPageHeader
        title="Ajustes"
        description="Configura los datos del sitio y las redes sociales del pie de página."
      />

      <div className="grid gap-6">
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
            Datos del sitio
          </h2>
          <SiteSettingsForm settings={settings} />
        </section>

        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="font-display mb-1 text-sm font-bold tracking-tight text-foreground">
            Redes sociales
          </h2>
          <p className="mb-4 text-sm text-muted">
            Los enlaces visibles aparecen en el pie de página de la tienda.
          </p>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="order-2 min-w-0 lg:order-1">
              {socialLinks.length === 0 ? (
                <p className="rounded-input border border-dashed border-border px-4 py-6 text-sm text-muted">
                  Aún no hay redes sociales configuradas.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-card border border-border bg-background">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-xs text-muted">
                        <th className="px-4 py-2.5 font-semibold">Red</th>
                        <th className="px-4 py-2.5 font-semibold">URL</th>
                        <th className="px-4 py-2.5 font-semibold">Orden</th>
                        <th className="px-4 py-2.5 font-semibold">Estado</th>
                        <th className="px-4 py-2.5 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {socialLinks.map((link) => (
                        <tr key={link.id} className="border-b border-border/40 last:border-b-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface"
                                style={link.color ? { color: link.color } : undefined}
                              >
                                <SocialIcon icon={link.icon} className="size-4" />
                              </span>
                              <span className="font-semibold text-foreground">{link.name}</span>
                            </div>
                          </td>
                          <td className="max-w-56 truncate px-4 py-3 text-muted">{link.url}</td>
                          <td className="px-4 py-3 text-muted">{link.order}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                link.visible
                                  ? "bg-success/10 text-success"
                                  : "bg-muted/10 text-muted",
                              )}
                            >
                              {link.visible ? "Visible" : "Oculto"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/dashboard/ajustes?edit=${link.id}`}
                                className="text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                              >
                                Editar
                              </Link>
                              <SocialLinkDeleteButton id={link.id} name={link.name} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="order-1 self-start rounded-card border border-border bg-background p-4 lg:order-2">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold tracking-tight text-foreground">
                  {editing ? `Editar "${editing.name}"` : "Nueva red social"}
                </h3>
                {editing ? (
                  <Link href="/dashboard/ajustes">
                    <Button variant="secondary" size="sm">
                      Cancelar
                    </Button>
                  </Link>
                ) : null}
              </div>
              <SocialLinkForm
                initial={editing ?? undefined}
                submitLabel={editing ? "Guardar cambios" : "Añadir red"}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
