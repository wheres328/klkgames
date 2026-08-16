import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Brand } from "@/components/layout/Brand";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { siteConfig } from "@/config/site";
import type { Game } from "@/types/game";
import type { Genre } from "@/types/genre";
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
  { label: "Donaciones", href: "/donar" },
  { label: "Contacto", href: "/contact" },
];

export interface FooterProps {
  games: Game[];
  genres: Genre[];
  settings?: SiteSettings;
  socialLinks?: SocialLinkView[];
}

export function Footer({ games, genres, settings, socialLinks }: FooterProps) {
  const featuredGames = games.slice(0, 5);
  const footerGenres = genres.slice(0, 5);

  const name = settings?.name ?? siteConfig.name;
  const tagline = settings?.tagline ?? siteConfig.tagline;
  const logoUrl = settings?.logoUrl;
  const description = settings?.description ?? siteConfig.description;

  return (
    <footer className="mt-24 border-t border-border bg-surface/40 pb-24 lg:pb-0">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Brand name={name} tagline={tagline} logoUrl={logoUrl} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
            {socialLinks && socialLinks.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
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
              Juegos
            </h3>
            <ul className="mt-4 space-y-2.5">
              {featuredGames.map((game) => (
                <li key={game.slug}>
                  <Link
                    href={`/games/${game.slug}`}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {game.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              Géneros
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerGenres.map((genre) => (
                <li key={genre.slug}>
                  <Link
                    href={`/genres/${genre.slug}`}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {genre.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-border bg-background/40">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-accent">
                {item.label}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
