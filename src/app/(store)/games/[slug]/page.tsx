import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileArchive,
  KeyRound,
  Layers,
  Rocket,
  Shapes,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RatingStars } from "@/components/ui/RatingStars";
import { GameHero } from "@/components/game-detail/GameHero";
import { GameBackground } from "@/components/game-detail/GameBackground";
import { GameSubnav } from "@/components/game-detail/GameSubnav";
import { VideoSection } from "@/components/game-detail/VideoSection";
import { GallerySection } from "@/components/game-detail/GallerySection";
import { RateGameBox } from "@/components/game-detail/RateGameBox";
import { RequirementsTable } from "@/components/game-detail/RequirementsTable";
import { CommentComposer } from "@/components/game-detail/CommentComposer";
import { DownloadCard } from "@/components/cards/DownloadCard";
import { GameRowList } from "@/components/cards/GameRowList";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { CommentCard } from "@/components/cards/CommentCard";
import { ZipPasswordBadge } from "@/components/game-detail/ZipPasswordBadge";
import {
  getGameBySlug,
  getSimilarGames,
  listPublishedGameSlugs,
} from "@/server/services/gameService";
import { getArticlesForGames } from "@/server/services/articleService";
import { getCommentsForGame } from "@/server/services/commentService";
import { isFavorite } from "@/server/services/favoriteService";
import { getUserRating } from "@/server/services/ratingService";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { formatDate } from "@/lib/format";
import { getGameImages } from "@/lib/game-images";
import type { Game } from "@/types/game";
import type { ReactNode } from "react";

export interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listPublishedGameSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Juego no encontrado" };
  const { cover } = getGameImages(game);
  return {
    title: game.name,
    description: game.description,
    openGraph: {
      title: game.name,
      description: game.description,
      images: [{ url: cover.url }],
    },
  };
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-32">
      <SectionHeader title={title} description={description} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-2.5 last:border-0">
      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function InfoPanel({ game }: { game: Game }) {
  const modes =
    game.isSingleplayer && game.isMultiplayer
      ? "Un jugador y multijugador"
      : game.isMultiplayer
        ? "Multijugador"
        : game.isSingleplayer
          ? "Un jugador"
          : "Multijugador";

  const genreNames = game.genreNames?.length
    ? game.genreNames.map((genre) => genre.name).join(", ")
    : game.genres.join(", ");

  const platformNames = game.platformNames?.length
    ? game.platformNames.map((platform) => platform.name).join(", ")
    : game.platforms.join(", ");

  return (
    <dl className="rounded-card border border-border bg-surface/60 p-5">
      <InfoRow label="Desarrollador" value={game.developer} />
      <InfoRow label="Editor" value={game.publisher} />
      <InfoRow
        label="Lanzamiento"
        value={
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-accent" aria-hidden />
            {formatDate(game.releaseDate, "long")}
          </span>
        }
      />
      <InfoRow label="Géneros" value={genreNames} />
      <InfoRow label="Plataformas" value={platformNames} />
      <InfoRow label="Modos" value={modes} />
      <InfoRow
        label="Estado"
        value={
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-3.5 text-accent" aria-hidden />
            {game.status === "released"
              ? "Lanzado"
              : game.status === "early-access"
                ? "Acceso anticipado"
                : game.status === "upcoming"
                  ? "Próximamente"
                  : game.status === "demo"
                    ? "Demo"
                    : "Abandonado"}
          </span>
        }
      />
      <InfoRow
        label="Modelo"
        value={
          <span className="inline-flex items-center gap-1.5">
            <Shapes className="size-3.5 text-accent" aria-hidden />
            {game.isIndie ? "Indie" : "Comercial"}
          </span>
        }
      />
    </dl>
  );
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const similar = await getSimilarGames(game.id);
  const gameSlugs = similar.map((g) => g.slug).concat(slug);
  const currentUser = await getCurrentUser();
  const [relatedArticles, comments] = await Promise.all([
    getArticlesForGames(gameSlugs, 4),
    getCommentsForGame(game.id, currentUser?.id),
  ]);

  let initialFavorited = false;
  let myRating: number | null = null;
  if (currentUser) {
    [initialFavorited, myRating] = await Promise.all([
      isFavorite(currentUser.id, game.id),
      getUserRating(currentUser.id, game.id),
    ]);
  }

  const genreRefs = game.genreNames?.length
    ? game.genreNames.map((genre) => ({ slug: genre.slug, name: genre.name }))
    : [];
  const platformRefs = game.platformNames?.length
    ? game.platformNames.map((platform) => ({
        slug: platform.slug,
        shortName: platform.name,
      }))
    : [];

  const userSummary = currentUser
    ? {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.image ?? "",
      }
    : null;

  const { banner } = getGameImages(game);

  return (
    <>
      <GameBackground url={banner.url} alt={`Fondo de ${game.name}`} />
      <GameHero
        game={game}
        genres={genreRefs}
        platforms={platformRefs}
        gameId={game.id}
        initialFavorited={initialFavorited}
      />
      <GameSubnav />

      <Container className="relative z-10 py-10">
        {/* Descripción + Información en columnas */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Section id="descripcion" title="Descripción" description={`Sobre ${game.name}.`}>
              <div className="space-y-4 rounded-card border border-border bg-surface/40 p-6 text-sm leading-relaxed text-muted sm:text-base">
                <p className="text-foreground">{game.description}</p>
                <p>{game.longDescription}</p>
              </div>
            </Section>
          </div>
          <div>
            <Section id="info" title="Información" description="Ficha técnica">
              <InfoPanel game={game} />
            </Section>
          </div>
        </div>

        <Section id="caracteristicas" title="Características">
          <ul className="grid gap-3 sm:grid-cols-2">
            {game.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 rounded-card border border-border bg-surface/60 p-3.5"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="video" title="Vídeos">
          <VideoSection videos={game.videos} gameName={game.name} />
        </Section>

        <Section id="galeria" title="Galería de capturas">
          <GallerySection screenshots={game.screenshots} gameName={game.name} />
        </Section>

        <Section
          id="valoraciones"
          title="Valoraciones y reseñas"
          description={`Opiniones de la comunidad sobre ${game.name}.`}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-card border border-border bg-surface/60 p-6 text-center">
              <p className="font-display text-5xl font-bold text-foreground">
                {game.rating.toFixed(1)}
              </p>
              <div className="mt-2 flex justify-center">
                <RatingStars value={game.rating} size="lg" />
              </div>
              <p className="mt-2 text-xs text-muted">
                Basada en {game.ratingCount.toLocaleString("es-ES")} valoraciones
              </p>
              <div className="mt-4 flex justify-center gap-1.5">
                {(game.platformNames?.length ? game.platformNames : []).map((platform) => (
                  <span
                    key={platform.slug}
                    className="rounded-input border border-border bg-surface-raised px-2 py-0.5 text-[10px] font-bold text-muted"
                  >
                    {platform.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-card border border-border bg-surface/60 p-6">
              <h3 className="font-display text-sm font-semibold text-foreground">
                Distribución de puntuaciones
              </h3>
              <ul className="mt-4 space-y-2.5">
                {game.starDistribution
                  .slice()
                  .sort((a, b) => b.stars - a.stars)
                  .map((row) => (
                    <li key={row.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-8 shrink-0 text-muted">{row.stars} ★</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised">
                        <span
                          className="block h-full rounded-full bg-warning"
                          style={{ width: `${row.percentage}%` }}
                        />
                      </span>
                      <span className="w-10 shrink-0 text-right text-muted">{row.percentage}%</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <RateGameBox
                gameId={game.id}
                gameName={game.name}
                currentRating={game.rating}
                ratingCount={game.ratingCount}
                currentUser={userSummary}
                myRating={myRating}
              />
            </div>
          </div>
        </Section>

        <Section
          id="requisitos"
          title="Requisitos del sistema"
          description="Especificaciones mínimas y recomendadas para PC."
        >
          <RequirementsTable
            minimum={game.requirements.minimum}
            recommended={game.requirements.recommended}
          />
          <p className="mt-3 text-xs text-muted">
            Los requisitos pueden variar según la plataforma y las actualizaciones del juego.
          </p>
        </Section>

        <Section
          id="descargas"
          title="Descargas"
          description={`Obtén ${game.name} en tu plataforma favorita.`}
        >
          <div className="space-y-3">
            {game.downloads.map((download) => (
              <DownloadCard key={download.id} download={download} />
            ))}
          </div>
        </Section>

        <Section
          id="instalacion"
          title="Instrucciones de instalación"
          description="Sigue estos pasos para empezar a jugar."
        >
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Download,
                title: "Descargar",
                body: 'Pulsa el botón "Descargar" de la sección de descargas o visita la web oficial del juego.',
              },
              {
                icon: FileArchive,
                title: "Abrir el ZIP y poner la contraseña",
                body: "Extrae el archivo .zip en una carpeta con permisos de escritura. El descompresor te pedirá la contraseña del siguiente paso.",
              },
              {
                icon: KeyRound,
                title: "Contraseña del ZIP",
                body: game.zipPassword ? (
                  <ZipPasswordBadge password={game.zipPassword} />
                ) : (
                  "Este juego no tiene contraseña de instalación configurada."
                ),
              },
              {
                icon: Rocket,
                title: "Instalar, abrir como administrador y jugar",
                body: "Ejecuta el instalador o el .exe con «Ejecutar como administrador», sigue los pasos y ¡a jugar!",
              },
            ].map(
              (
                step: { icon: typeof Download; title: string; body: ReactNode },
                index,
              ) => (
                <li
                  key={step.title}
                  className="flex items-start gap-3 rounded-card border border-border bg-surface/60 p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-card bg-accent/10 text-accent">
                    <step.icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      <span className="mr-1.5 text-xs font-bold text-muted">{index + 1}.</span>
                      {step.title}
                    </p>
                    <div className="mt-1 text-sm text-muted">{step.body}</div>
                  </div>
                </li>
              ),
            )}
          </ol>
        </Section>

        <Section
          id="similares"
          title="Juegos similares"
          description={`Títulos que los jugadores de ${game.name} también disfrutan.`}
        >
          <GameRowList games={similar} showDate withHeader />
        </Section>

        <Section
          id="comentarios"
          title="Comentarios y valoraciones"
          description={`Únete a la conversación sobre ${game.name}.`}
        >
          {userSummary ? (
            <CommentComposer currentUser={userSummary} gameId={game.id} />
          ) : (
            <p className="rounded-card border border-dashed border-border bg-surface/40 p-6 text-sm text-muted">
              Inicia sesión para dejar tu comentario y valoración.
            </p>
          )}
          <div className="mt-6 space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={userSummary?.id}
                gameId={game.id}
              />
            ))}
          </div>
        </Section>

        {relatedArticles.length > 0 && (
          <Section
            id="articulos"
            title="Artículos relacionados"
            description={`Contenido editorial sobre ${game.name} y títulos cercanos.`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </Section>
        )}
      </Container>
    </>
  );
}
