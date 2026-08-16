import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Brand } from "@/components/layout/Brand";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { siteConfig } from "@/config/site";
import type { Game } from "@/types/game";
import { getGameImages } from "@/lib/game-images";
import type { SiteSettings, SocialLinkView } from "@/server/services/siteSettingsService";

const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Juegos", href: "/games" },
  { label: "Géneros", href: "/genres" },
  { label: "Artículos", href: "/articles" },
  { label: "Buscar", href: "/search" },
];

const legalLinks = [
  { label: "Privacidad", href: "/privacy" },
  { label: "Términos", href: "/terms" },
  { label: "Contacto", href: "/contact" },
];

export interface GameFooterProps {
  game: Game;
  settings?: SiteSettings;
  socialLinks?: SocialLinkView[];
}

// Footer dinámico para páginas de detalle: el banner del juego aparece como
// extensión atmosférica (blur + opacidad + gradiente), nunca como imagen pegada.
export function GameFooter({ game, settings, socialLinks }: GameFooterProps) {
  const { banner } = getGameImages(game);

  const name = settings?.name ?? siteConfig.name;
  const tagline = settings?.tagline ?? siteConfig.tagline;
  const logoUrl = settings?.logoUrl;
  const description = settings?.description ?? siteConfig.description;

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border">
      <Image
        src={banner.url}
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-110 object-cover opacity-20 blur-2xl"
        aria-hidden
      />
      {/* Transición desde el contenido (empieza con el fondo normal) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-background via-background/75 to-background/55"
      />
      <div aria-hidden className="absolute inset-0 bg-background/40" />

      <div className="relative">
        <Container className="pb-14 pt-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Brand name={name} tagline={tagline} logoUrl={logoUrl} />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-2">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                  Navegación
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted transition-colors hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                  Volver a {game.name}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {[
                    { label: "Valoraciones", href: "#valoraciones" },
                    { label: "Requisitos", href: "#requisitos" },
                    { label: "Descargas", href: "#descargas" },
                    { label: "Comentarios", href: "#comentarios" },
                    { label: "Catálogo", href: "/games" },
                  ].map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="text-sm text-muted transition-colors hover:text-accent"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                  Comunidad
                </h3>
                {socialLinks && socialLinks.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={link.name}
                        title={link.name}
                        className="flex size-9 items-center justify-center rounded-card border border-border bg-surface text-muted transition-colors hover:border-accent/40 hover:text-accent"
                        style={link.color ? { color: link.color } : undefined}
                      >
                        <SocialIcon icon={link.icon} className="size-4" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Container>

        <div className="border-t border-border bg-background/60">
          <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
            <p>© {new Date().getFullYear()} {name}. Todos los derechos reservados.</p>
            <div className="flex items-center gap-5">
              {legalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}
