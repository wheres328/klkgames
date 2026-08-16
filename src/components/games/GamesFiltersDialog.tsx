"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { GamesFilters, type GamesFiltersProps } from "@/components/games/GamesFilters";

// Botón + diálogo con los filtros para móvil/tablet. En desktop se muestra el
// panel lateral estático (GamesFilters) y este componente queda oculto.
export function GamesFiltersDialog(props: GamesFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-card border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-accent lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filtros
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Filtros de catálogo">
        <GamesFilters {...props} onSubmit={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
