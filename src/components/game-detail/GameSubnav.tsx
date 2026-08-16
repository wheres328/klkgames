"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const gameSections = [
  { id: "info", label: "Información" },
  { id: "descripcion", label: "Descripción" },
  { id: "caracteristicas", label: "Características" },
  { id: "video", label: "Vídeos" },
  { id: "galeria", label: "Galería" },
  { id: "valoraciones", label: "Valoraciones" },
  { id: "requisitos", label: "Requisitos" },
  { id: "descargas", label: "Descargas" },
  { id: "instalacion", label: "Instalación" },
  { id: "similares", label: "Similares" },
  { id: "comentarios", label: "Comentarios" },
  { id: "articulos", label: "Artículos" },
];

export interface GameSubnavProps {
  sections?: Array<{ id: string; label: string }>;
  className?: string;
}

// Barra de navegación secundaria del detalle de juego (estilo aplicación/base de
// datos). Sticky bajo el navbar en desktop, scroll horizontal en móvil. Resalta
// la sección visible con scrollspy.
export function GameSubnav({ sections = gameSections, className }: GameSubnavProps) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -65% 0px", threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Secciones del juego"
      className={cn(
        "sticky top-14 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl",
        className,
      )}
    >
      <div className="scrollbar-none flex gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:justify-center lg:px-8">
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-pill px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
              active === id
                ? "bg-accent/15 text-accent-2"
                : "text-muted hover:bg-surface-raised hover:text-foreground",
            )}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
