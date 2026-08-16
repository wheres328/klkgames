import Link from "next/link";
import Image from "next/image";
import { getGenreById, listGenres } from "@/server/services/genreService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GenreForm } from "@/components/admin/GenreForm";
import { GenreDeleteButton } from "@/components/admin/GenreDeleteButton";
import { GenreArt } from "@/components/ui/GenreArt";
import { resolveGenrePattern } from "@/lib/genre-art";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdminGenresPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function AdminGenresPage({ searchParams }: AdminGenresPageProps) {
  const { edit } = await searchParams;
  const [genres, editing] = await Promise.all([
    listGenres(),
    edit ? getGenreById(edit) : Promise.resolve(null),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Géneros"
        description={`${genres.length} género(s) en total.`}
        action={
          editing ? (
            <Link href="/dashboard/generos">
              <Button variant="secondary" size="sm">
                Cancelar edición
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 min-w-0 lg:order-1">
          {genres.length === 0 ? (
            <EmptyState title="No hay géneros" description="Crea el primer género del catálogo." />
          ) : (
            <div className="overflow-x-auto rounded-card border border-border bg-surface">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs text-muted">
                    <th className="px-4 py-2.5 font-semibold">Género</th>
                    <th className="px-4 py-2.5 font-semibold">Slug</th>
                    <th className="px-4 py-2.5 font-semibold">Juegos</th>
                    <th className="px-4 py-2.5 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {genres.map((genre) => (
                    <tr key={genre.id} className="border-b border-border/40 last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="block size-9 shrink-0 overflow-hidden rounded-input border border-border bg-background">
                            {genre.image ? (
                              <Image
                                src={genre.image}
                                alt=""
                                width={36}
                                height={45}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <GenreArt
                                {...resolveGenrePattern(genre)}
                                accentFrom={genre.accentFrom}
                                accentTo={genre.accentTo}
                                className="h-full w-full"
                              />
                            )}
                          </span>
                          <span className="font-semibold text-foreground">{genre.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{genre.slug}</td>
                      <td className="px-4 py-3 text-muted">{genre.gameCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/generos?edit=${genre.id}`}
                            className="text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                          >
                            Editar
                          </Link>
                          <GenreDeleteButton id={genre.id} name={genre.name} />
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
            {editing ? `Editar "${editing.name}"` : "Nuevo género"}
          </h2>
          <GenreForm
            initial={editing ?? undefined}
            submitLabel={editing ? "Guardar cambios" : "Crear género"}
          />
        </div>
      </div>
    </div>
  );
}
