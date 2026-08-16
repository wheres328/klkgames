import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { DonateGrid } from "@/components/donate/DonateGrid";
import { getSiteSettings } from "@/server/services/siteSettingsService";
import { listDonations } from "@/server/services/donationService";

export const metadata: Metadata = {
  title: "Donaciones",
  description: "Apoya el proyecto y ayúdanos a mantener el sitio en marcha.",
};

export default async function DonatePage() {
  const [settings, donations] = await Promise.all([
    getSiteSettings(),
    listDonations({ activeOnly: true }),
  ]);

  return (
    <div className="animate-rise-in">
      <section className="border-b border-border/60 bg-surface/50">
        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-input border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-2">
              <Heart className="size-3.5" aria-hidden />
              Gracias por estar aquí
            </span>
            <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Apoya {settings.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Cada donación ayuda a cubrir servidores, ancho de banda y herramientas para seguir
              trayendo juegos y artículos a la comunidad. Todo el apoyo es voluntario.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        {donations.length > 0 ? (
          <DonateGrid donations={donations} />
        ) : (
          <p className="rounded-card border border-border bg-surface p-6 text-center text-sm text-muted">
            Pronto habilitaremos canales de donación. Mientras tanto, puedes escribirnos.
          </p>
        )}

        {settings.contactEmail ? (
          <div className="mx-auto mt-12 max-w-md rounded-card border border-border bg-surface p-5 text-center">
            <Mail className="mx-auto size-5 text-accent" aria-hidden />
            <p className="mt-2 text-sm text-muted">
              ¿Prefieres coordinar otra forma de apoyo?
            </p>
            <Link
              href={`mailto:${settings.contactEmail}`}
              className="mt-1 inline-block text-sm font-semibold text-accent transition-colors hover:text-accent-2"
            >
              {settings.contactEmail}
            </Link>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
