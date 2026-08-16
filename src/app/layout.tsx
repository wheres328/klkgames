import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/server/services/siteSettingsService";
import type { SiteSettings } from "@/server/services/siteSettingsService";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const FALLBACK_SETTINGS: SiteSettings = {
  name: siteConfig.name,
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  url: siteConfig.url,
  logoUrl: null,
  faviconUrl: null,
  contactEmail: null,
};

export async function generateMetadata(): Promise<Metadata> {
  let settings = FALLBACK_SETTINGS;
  try {
    settings = await getSiteSettings();
  } catch {
    // Si la base de datos no responde se usan los valores por defecto.
  }

  return {
    metadataBase: new URL(settings.url),
    title: {
      default: settings.name,
      template: `%s | ${settings.name}`,
    },
    description: settings.description,
    icons: settings.faviconUrl
      ? { icon: settings.faviconUrl }
      : { icon: "/icon.svg" },
    openGraph: {
      type: "website",
      title: settings.name,
      description: settings.description,
      url: settings.url,
      siteName: settings.name,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.name,
      description: settings.description,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
