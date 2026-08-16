import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { getSiteSettings, listVisibleSocialLinks } from "@/server/services/siteSettingsService";
import { SocialIcon } from "@/components/ui/SocialIcon";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponte en contacto con el equipo de la plataforma.",
};

export default async function ContactPage() {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    listVisibleSocialLinks(),
  ]);

  const email = settings.contactEmail ?? null;

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Contacto
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          ¿Tienes dudas, sugerencias o un problema con tu cuenta? Escríbenos y te
          responderemos lo antes posible.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <div className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-input bg-gradient-to-br from-accent to-accent-2 text-white">
                <Mail className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-sm font-bold tracking-tight text-foreground">
                  Correo
                </h2>
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="text-sm text-accent transition-colors hover:text-accent-2"
                  >
                    {email}
                  </a>
                ) : (
                  <p className="text-sm text-muted">El correo de contacto se anunciará pronto.</p>
                )}
              </div>
            </div>
          </div>

          {socialLinks.length > 0 ? (
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="font-display text-sm font-bold tracking-tight text-foreground">
                Redes sociales
              </h2>
              <p className="mt-1 text-sm text-muted">Síguenos para no perderte nada.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.name}
                    title={link.name}
                    className="flex size-10 items-center justify-center rounded-card border border-border bg-background text-muted transition-colors hover:border-accent/40 hover:text-accent"
                    style={link.color ? { color: link.color } : undefined}
                  >
                    <SocialIcon icon={link.icon} className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <p className="text-xs text-muted">
            También puedes consultar la{" "}
            <Link href="/privacy" className="text-accent transition-colors hover:text-accent-2">
              política de privacidad
            </Link>{" "}
            y los{" "}
            <Link href="/terms" className="text-accent transition-colors hover:text-accent-2">
              términos de uso
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
