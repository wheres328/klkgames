import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays, Medal, Shield, Sparkles, Star, Trophy } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { BadgeTile } from "@/components/profile/BadgeTile";
import { EditProfileButton } from "@/components/profile/EditProfileButton";
import { BadgeAwardPanel } from "@/components/profile/BadgeAwardPanel";
import { AdminApplicationPanel } from "@/components/profile/AdminApplicationPanel";
import { ReputationAwardPanel } from "@/components/profile/ReputationAwardPanel";
import { getProfileByUsername } from "@/server/services/profileService";
import { getProfileBadges } from "@/server/services/badgeService";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { getActorPermissions } from "@/server/services/permissionService";
import { MIN_REPUTATION_TO_APPLY, REPUTATION_REASON_LABELS } from "@/server/services/reputationService";
import { siteConfig } from "@/config/site";
import { formatCount } from "@/lib/format";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  user: "Miembro",
};

function formatJoinDate(iso?: string): string {
  if (!iso) return "Miembro";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Miembro";
  return `Miembro desde ${new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date)}`;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Perfil no encontrado" };
  return {
    title: `${profile.user.name} (@${profile.user.username})`,
    description: profile.user.bio ?? `Perfil de ${profile.user.name} en ${siteConfig.name}.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [profile, currentUser] = await Promise.all([
    getProfileByUsername(username),
    getCurrentUser(),
  ]);

  if (!profile) notFound();
  const { user, badges, stats, favoriteGames, reputation, application, rank } = profile;

  const isOwnProfile = currentUser?.id === user.id;
  const isStaff = currentUser?.role === "ADMIN" || currentUser?.role === "MODERATOR";

  const viewerPermissions = await getActorPermissions(currentUser?.id);
  const canAwardBadges = viewerPermissions.includes("badges.award");
  const canAdjustReputation = viewerPermissions.includes("reputation.award");

  const { available: availableBadges } = canAwardBadges
    ? await getProfileBadges(user.id)
    : { available: [] };

  const roleLabel = ROLE_LABELS[user.role] ?? "Miembro";

  return (
    <div className="animate-rise-in">
      {/* Portada */}
      <div className="relative h-52 w-full overflow-hidden border-b border-border bg-surface sm:h-60">
        {user.cover ? (
          <Image
            src={user.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            aria-hidden
          />
        ) : (
          <div
            aria-hidden
            className="bg-grid-fade absolute inset-0"
            style={{ background: "linear-gradient(180deg, #181818 0%, #0d0d0d 100%)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-background/10" />
      </div>

      <Container>
        {/* Cabecera del perfil */}
        <div className="relative -mt-14 pb-8">
          <div className="flex flex-wrap items-end gap-4">
            <div className="rounded-input border-2 border-background bg-background shadow-lg shadow-black/40">
              <Avatar src={user.avatar} name={user.name} size="lg" className="size-24" />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {user.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-input border border-border bg-surface-raised px-2 py-0.5 text-xs font-semibold text-muted">
                  {user.role === "admin" || user.role === "moderator" ? (
                    <Shield className="size-3 text-accent" aria-hidden />
                  ) : null}
                  {roleLabel}
                </span>
                {rank ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-input border border-border bg-surface-raised px-2 py-0.5 text-xs font-semibold"
                    style={rank.color ? { color: rank.color } : undefined}
                  >
                    <Shield className="size-3" aria-hidden />
                    {rank.name}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-muted">@{user.username}</p>
            </div>
            {isOwnProfile ? (
              <div className="pb-1">
                <EditProfileButton
                  profile={{
                    name: user.name,
                    bio: user.bio ?? "",
                    avatar: user.avatar,
                    cover: user.cover ?? "",
                    username: user.username,
                  }}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatJoinDate(user.createdAt)}
            </span>
          </div>

          {user.bio ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{user.bio}</p> : null}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 border-y border-border/60 py-5">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-foreground">
              {formatCount(stats.favorites)}
            </p>
            <p className="text-xs text-muted">Favoritos</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-foreground">{formatCount(stats.ratings)}</p>
            <p className="text-xs text-muted">Valoraciones</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-foreground">{formatCount(stats.comments)}</p>
            <p className="text-xs text-muted">Comentarios</p>
          </div>
          <div className="text-center">
            <p className="font-display flex items-center justify-center gap-1 text-2xl font-bold text-accent-2">
              <Star className="size-5 text-accent" aria-hidden />
              {formatCount(reputation.points)}
            </p>
            <p className="text-xs text-muted">Reputación · {reputation.level}</p>
          </div>
        </div>

        {/* Reputación */}
        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div>
            <SectionHeader
              title="Reputación"
              description="Puntos ganados por tu aporte a la comunidad."
            />
            <div className="mt-4 rounded-card border border-border bg-surface p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-input bg-accent/10 text-accent-2">
                  <Trophy className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-foreground">
                    {reputation.level}
                  </p>
                  <p className="text-xs text-muted">{reputation.points} puntos</p>
                </div>
              </div>
              {reputation.history.length > 0 ? (
                <ul className="mt-4 space-y-2 border-t border-border/60 pt-4">
                  {reputation.history.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-2 rounded-input bg-surface-raised px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate text-muted">
                        {REPUTATION_REASON_LABELS[entry.reason] ?? entry.reason}
                        {entry.note ? (
                          <span className="text-muted/60"> · {entry.note}</span>
                        ) : null}
                      </span>
                      <span
                        className={
                          entry.delta >= 0
                            ? "shrink-0 font-semibold text-success"
                            : "shrink-0 font-semibold text-danger"
                        }
                      >
                        {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-xs text-muted">
                  Aún no hay actividad de reputación. Participa con comentarios, valoraciones y
                  me gusta para ganar puntos.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <AdminApplicationPanel
              isStaff={isStaff}
              isOwnProfile={isOwnProfile}
              application={
                application
                  ? {
                      ...application,
                      createdAt: application.createdAt.toISOString(),
                      reviewedAt: application.reviewedAt?.toISOString() ?? null,
                    }
                  : null
              }
              reputation={reputation.points}
              minReputation={MIN_REPUTATION_TO_APPLY}
            />
            {canAdjustReputation ? (
              <div className="max-w-md">
                <ReputationAwardPanel
                  userId={user.id}
                  username={user.username}
                  currentPoints={reputation.points}
                />
              </div>
            ) : null}
          </div>
        </section>

        {/* Bóveda de medallas */}
        <section className="mt-10">
          <SectionHeader
            title="Bóveda de medallas"
            description={
              badges.length > 0
                ? `${badges.length} ${badges.length === 1 ? "medalla" : "medallas"} desbloqueada${badges.length === 1 ? "" : "s"}.`
                : "Medallas otorgadas por el equipo de la comunidad."
            }
          />

          {canAwardBadges ? (
            <div className="mt-6 max-w-md">
              <BadgeAwardPanel
                userId={user.id}
                username={user.username}
                available={availableBadges}
                earned={badges}
              />
            </div>
          ) : null}

          <div className="mt-6">
            {badges.length === 0 ? (
              <EmptyState
                icon={Medal}
                title="Sin medallas todavía"
                description={
                  isOwnProfile
                    ? "Tu bóveda está vacía. Participa en la comunidad para ganar medallas."
                    : `${user.name} aún no ha desbloqueado medallas.`
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {badges.map((item) => (
                  <BadgeTile key={item.id} badge={item} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Juegos favoritos */}
        {favoriteGames.length > 0 ? (
          <section className="mt-12">
            <SectionHeader
              title="Juegos favoritos"
              description="Los títulos que marcan la colección de este jugador."
            />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {favoriteGames.map((game) => (
                <a
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="group relative aspect-video overflow-hidden rounded-card border border-border bg-surface"
                >
                  {game.cover ? (
                    <Image
                      src={game.cover}
                      alt={game.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-raised">
                      <Sparkles className="size-5 text-muted" aria-hidden />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <p className="absolute bottom-2 left-2.5 line-clamp-1 text-sm font-semibold text-white">
                    {game.name}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
