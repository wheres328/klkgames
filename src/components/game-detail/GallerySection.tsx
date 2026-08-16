"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/Dialog";

export interface GallerySectionProps {
  screenshots: string[];
  gameName: string;
}

export function GallerySection({ screenshots, gameName }: GallerySectionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const images = screenshots.filter((src) => src);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setSelected(src)}
            className="group relative aspect-video overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-accent/50"
          >
            <Image
              src={src}
              alt={`Captura ${index + 1} de ${gameName}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            <span className="absolute right-2 bottom-2 rounded-input bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur-sm">
              {index + 1}/{images.length}
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={`Capturas — ${gameName}`}
        className="sm:max-w-4xl"
      >
        {selected ? (
          <div className="relative aspect-video overflow-hidden rounded-card border border-border bg-black">
            <Image src={selected} alt={`Captura de ${gameName}`} fill className="object-contain" />
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
