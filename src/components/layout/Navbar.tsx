"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, Menu, Search, User } from "lucide-react";
import type { SearchSuggestion } from "@/types/search";
import type { UserSummary } from "@/types/user";
import type { SiteSettings } from "@/server/services/siteSettingsService";
import { authClient } from "@/lib/auth-client";
import { Container } from "@/components/layout/Container";
import { Brand } from "@/components/layout/Brand";
import { SearchInput } from "@/components/ui/SearchInput";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Juegos", href: "/games" },
  { label: "Géneros", href: "/genres" },
  { label: "Artículos", href: "/articles" },
  { label: "Comunidad", href: "/#comunidad" },
];

export interface NavbarProps {
  suggestions: SearchSuggestion[];
  currentUser?: UserSummary | null;
  settings?: SiteSettings;
}

export function Navbar({ suggestions, currentUser, settings }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const sessionUser = session?.user as
    | { id: string; name: string; username?: string; image?: string | null; role?: string }
    | undefined;

  const user: UserSummary | null = sessionUser
    ? {
        id: sessionUser.id,
        username: sessionUser.username ?? "",
        name: sessionUser.name,
        avatar: sessionUser.image ?? "",
      }
    : (currentUser ?? null);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border/80 bg-background/90 shadow-lg shadow-black/30 backdrop-blur-xl"
          : "border-border/40 bg-background/60 backdrop-blur-md",
      )}
    >
      {/* Hairline de acento (violeta → cian) */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
      />

      <Container className="relative flex h-14 items-center gap-4">
        <Brand
          className="shrink-0"
          name={settings?.name}
          tagline={settings?.tagline}
          logoUrl={settings?.logoUrl}
          animate
        />

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-input px-3 py-1.5 text-[13px] font-semibold transition-colors",
                  isActive
                    ? "text-accent-2"
                    : "text-muted hover:bg-surface-raised hover:text-foreground",
                )}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-accent to-accent-2"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          {/* Búsqueda global con protagonismo */}
          <div className="hidden flex-1 items-center md:flex md:max-w-md lg:max-w-xl">
            <div className="relative flex-1">
              <SearchInput suggestions={suggestions} />
            </div>
          </div>

          <Link
            href="/favorites"
            aria-label="Favoritos"
            className="hidden size-9 shrink-0 items-center justify-center rounded-input border border-border bg-surface text-muted transition-colors hover:border-accent/40 hover:text-accent sm:inline-flex"
          >
            <Heart className="size-4" aria-hidden />
          </Link>

          {user ? (
            <div className="hidden md:block">
              <Dropdown
                trigger={
                  <span className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-2.5 pl-1 transition-colors hover:border-accent/40">
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <span className="max-w-24 truncate text-[13px] font-medium text-foreground">
                      {user.name}
                    </span>
                  </span>
                }
              >
                {sessionUser?.role === "ADMIN" ? (
                  <DropdownItem onSelect={() => router.push("/dashboard")}>
                    <LayoutDashboard className="size-4 text-muted" aria-hidden /> Panel de
                    administración
                  </DropdownItem>
                ) : null}
                {sessionUser?.username ? (
                  <DropdownItem onSelect={() => router.push(`/usuarios/${sessionUser.username}`)}>
                    <User className="size-4 text-muted" aria-hidden /> Mi perfil
                  </DropdownItem>
                ) : null}
                <DropdownItem onSelect={() => router.push("/favorites")}>
                  <Heart className="size-4 text-muted" aria-hidden /> Favoritos
                </DropdownItem>
                <DropdownItem onSelect={handleLogout}>
                  <LogOut className="size-4 text-muted" aria-hidden /> Cerrar sesión
                </DropdownItem>
              </Dropdown>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-9 items-center rounded-input border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:inline-flex"
            >
              Iniciar sesión
            </Link>
          )}

          {/* Búsqueda accesible en tablet pequeña */}
          <Link
            href="/search"
            aria-label="Buscar"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-input border border-border bg-surface text-muted transition-colors hover:border-accent/40 hover:text-accent md:hidden"
          >
            <Search className="size-4" aria-hidden />
          </Link>

          <IconButton label="Abrir menú" className="lg:hidden" onClick={() => setDrawerOpen(true)}>
            <Menu className="size-5" aria-hidden />
          </IconButton>
        </div>
      </Container>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        suggestions={suggestions}
        currentUser={currentUser}
      />
    </header>
  );
}
