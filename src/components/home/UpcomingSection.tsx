import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarClock } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { RatingStars } from "@/components/ui/RatingStars";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import { formatDate } from "@/lib/format";
import type { Game } from "@/types/game";

export interface UpcomingSectionProps {
  main: Game | null;
  earlyAccess: Game[];
}

export function UpcomingSection({ main, earlyAccess }: UpcomingSectionProps) {
  if (!main && earlyAccess.length === 0) return null;

  return (
    <section className="mt-16">
      <Container>
        <SectionHeader
          eyebrow="No te lo pierdas"
          title="Próximos lanzamientos"
          description="Lo que está por llegar y los juegos en acceso anticipado que ya puedes probar."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {main && (
            <article className="relative overflow-hidden rounded-card border border-border bg-surface lg:col-span-2">
              <Image
                src={main.banner}
                alt={main.name}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              <div className="relative flex min-h-[380px] flex-col justify-end p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  {(main.genreNames ?? []).slice(0, 2).map((genre) => (
                    <Tag key={genre.slug}>{genre.name}</Tag>
                  ))}
                  <span className="inline-flex items-center gap-1.5 rounded-input bg-accent/90 px-2 py-1 text-[10px] font-bold text-white">
                    <CalendarClock className="size-3" aria-hidden />
                    PRÓXIMAMENTE
                  </span>
                </div>

                <h3 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
                  {main.name}
                </h3>
                <p className="mt-3 max-w-lg text-sm text-white/80">{main.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
                  <span className="font-semibold text-white">
                    {formatDate(main.releaseDate, "long")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <RatingStars value={main.rating} size="sm" />
                    {main.rating}
                  </span>
                  <span>{main.developer}</span>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/games/${main.slug}`}
                    className="inline-flex items-center gap-2 rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
                  >
                    <Bell className="size-4" aria-hidden />
                    Ver detalles
                  </Link>
                </div>
              </div>
            </article>
          )}

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              En acceso anticipado
            </p>
            {earlyAccess.map((game) => (
              <RecommendationCard key={game.id} game={game} />
            ))}
            {earlyAccess.length === 0 && (
              <div className="rounded-card border border-dashed border-border bg-surface/50 p-6 text-sm text-muted">
                Sin títulos en acceso anticipado por ahora.
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
