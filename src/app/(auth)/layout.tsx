import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { Container } from "@/components/layout/Container";
import { getSiteSettings } from "@/server/services/siteSettingsService";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
      />
      <header className="flex h-14 items-center border-b border-border/40">
        <Container>
          <Brand name={settings.name} tagline={settings.tagline} logoUrl={settings.logoUrl} />
        </Container>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
      <footer className="border-t border-border/40 py-4">
        <Container className="flex items-center justify-between text-xs text-muted">
          <span>{settings.name}</span>
          <Link href="/" className="transition-colors hover:text-foreground">
            Volver a la tienda
          </Link>
        </Container>
      </footer>
    </div>
  );
}
