"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  ClipboardList,
  Coins,
  ExternalLink,
  FileText,
  HandHeart,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Monitor,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const navSections = [
  {
    title: "Gestión",
    items: [
      { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
      { label: "Juegos", href: "/dashboard/juegos", icon: ClipboardList },
      { label: "Artículos", href: "/dashboard/articulos", icon: FileText },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { label: "Géneros", href: "/dashboard/generos", icon: Tags },
      { label: "Plataformas", href: "/dashboard/plataformas", icon: Monitor },
    ],
  },
  {
    title: "Comunidad",
    items: [
      { label: "Usuarios", href: "/dashboard/usuarios", icon: Users },
      { label: "Medallas", href: "/dashboard/medallas", icon: Award },
      { label: "Candidaturas", href: "/dashboard/candidaturas", icon: HandHeart },
      { label: "Auditoría", href: "/dashboard/auditoria", icon: ListChecks },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Donaciones", href: "/dashboard/donaciones", icon: Coins },
      { label: "Rangos", href: "/dashboard/rangos", icon: ShieldCheck },
      { label: "Ajustes", href: "/dashboard/ajustes", icon: Settings },
    ],
  },
];

interface AdminShellProps {
  user: { name: string; avatar: string; username: string };
  siteName?: string;
  siteLogoUrl?: string | null;
  children: ReactNode;
}

export function AdminShell({ user, siteName = siteConfig.name, siteLogoUrl, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-display font-bold text-foreground"
          >
            <span className="flex size-7 items-center justify-center overflow-hidden rounded-input bg-gradient-to-r from-accent to-accent-2 text-white">
              {siteLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={siteLogoUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                <ShieldCheck className="size-4" aria-hidden />
              )}
            </span>
            {siteName} <span className="text-accent">Admin</span>
          </Link>

          <nav
            aria-label="Navegación admin"
            className="ml-auto flex items-center gap-1 overflow-x-auto"
          >
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 rounded-input px-3 py-1.5 text-[13px] font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Ver tienda
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="shrink-0 text-muted"
            >
              <LogOut className="size-4" aria-hidden />
              Salir
            </Button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-border/60 lg:w-56 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted">@{user.username} · Admin</p>
            </div>
          </div>

          <nav
            aria-label="Menú del panel"
            className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible"
          >
            {navSections.map((section) => (
              <div key={section.title} className="contents lg:block">
                <p className="hidden px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-muted/70 uppercase lg:block">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex shrink-0 items-center gap-2.5 rounded-input px-3 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors lg:whitespace-normal",
                        isActive
                          ? "bg-surface-raised text-accent-2"
                          : "text-muted hover:bg-surface-raised hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
