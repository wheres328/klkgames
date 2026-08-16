"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Heart, LayoutDashboard, LogOut } from "lucide-react";
import type { SearchSuggestion } from "@/types/search";
import type { UserSummary } from "@/types/user";
import { authClient } from "@/lib/auth-client";
import { Brand } from "@/components/layout/Brand";
import { SearchInput } from "@/components/ui/SearchInput";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  suggestions: SearchSuggestion[];
  currentUser?: UserSummary | null;
}

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Juegos", href: "/games" },
  { label: "Géneros", href: "/genres" },
  { label: "Artículos", href: "/articles" },
  { label: "Comunidad", href: "/#comunidad" },
];

export function MobileDrawer({ open, onClose, suggestions, currentUser }: MobileDrawerProps) {
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
    onClose();
    router.push("/");
    router.refresh();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col border-l border-border bg-background shadow-2xl shadow-black/40 transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-label="Menú de navegación"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-input p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="px-5 pt-4">
          <SearchInput suggestions={suggestions} />
        </div>

        <nav
          aria-label="Navegación móvil"
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
        >
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "rounded-input px-3 py-3 text-base font-medium transition-colors",
                  isActive ? "bg-accent/10 text-accent" : "text-foreground hover:bg-surface",
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {sessionUser?.role === "ADMIN" ? (
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 rounded-input px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface"
            >
              <LayoutDashboard className="size-4 text-muted" aria-hidden /> Panel de administración
            </Link>
          ) : null}

          <Link
            href="/favorites"
            onClick={onClose}
            className="flex items-center gap-3 rounded-input px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface"
          >
            <Heart className="size-4 text-muted" aria-hidden /> Favoritos
          </Link>
        </nav>

        {user ? (
          <div className="flex items-center gap-3 border-t border-border px-5 py-4">
            <Avatar src={user.avatar} name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted">@{user.username}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="shrink-0"
            >
              <LogOut className="size-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 border-t border-border p-4">
            <Link href="/login" onClick={onClose} className="flex-1">
              <Button variant="secondary" className="w-full">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register" onClick={onClose} className="flex-1">
              <Button className="w-full">Crear cuenta</Button>
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
