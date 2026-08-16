"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Newspaper, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Juegos", href: "/games", icon: LayoutGrid },
  { label: "Buscar", href: "/search", icon: Search },
  { label: "Artículos", href: "/articles", icon: Newspaper },
  { label: "Perfil", href: "/favorites", icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/85 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-accent" : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
