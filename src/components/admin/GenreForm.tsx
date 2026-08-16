"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Save, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ColorPickerField } from "@/components/ui/ColorPickerField";
import { GenreArt } from "@/components/ui/GenreArt";
import {
  GENRE_PATTERN_LABELS,
  GENRE_PATTERN_STYLES,
  MAX_PATTERN_SEED,
  genreSeedFromName,
  type GenrePatternStyle,
} from "@/lib/genre-art";
import { adminCreateGenre, adminUpdateGenre } from "@/server/actions/admin";
import type { AdminActionResult } from "@/server/actions/admin";
import type { Genre } from "@/types/genre";
import { cn } from "@/lib/utils";

interface GenreFormProps {
  initial?: Genre;
  submitLabel: string;
}

function isValidImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function GenreForm({ initial, submitLabel }: GenreFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [accentFrom, setAccentFrom] = useState(initial?.accentFrom ?? "#7c3aed");
  const [accentTo, setAccentTo] = useState(initial?.accentTo ?? "#06b6d4");
  const [patternStyle, setPatternStyle] = useState<GenrePatternStyle>(
    initial?.patternStyle ?? "triangles",
  );
  const [patternSeed, setPatternSeed] = useState(
    initial?.patternSeed ?? genreSeedFromName(initial?.name ?? ""),
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const input = {
      slug: slug.trim(),
      name: name.trim(),
      image: image.trim(),
      description: description.trim(),
      accentFrom,
      accentTo,
      patternStyle,
      patternSeed,
    };

    startTransition(async () => {
      const result: AdminActionResult = initial
        ? await adminUpdateGenre(initial.id, input)
        : await adminCreateGenre(input);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nombre"
          placeholder="Survival"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          label="Slug (URL)"
          placeholder="survival"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Input
          label="Imagen (URL)"
          placeholder="https://..."
          value={image}
          onChange={(event) => setImage(event.target.value)}
        />
        <p className="text-xs text-muted">
          Deja la imagen vacía para mostrar el diseño vectorial sobre fondo oscuro; puedes añadirla
          más tarde.
        </p>
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Diseño de portada</h3>
            <p className="text-xs text-muted">
              Elige un patrón y pulsa Aleatorio para variarlo.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setPatternSeed(Math.floor(Math.random() * (MAX_PATTERN_SEED + 1)))}
          >
            <Shuffle className="size-4" aria-hidden />
            Aleatorio
          </Button>
        </div>

        <div className="mx-auto aspect-[4/5] w-full max-w-[180px] overflow-hidden rounded-input border border-border">
          {isValidImageUrl(image) ? (
            <Image
              src={image}
              alt="Vista previa de la portada"
              width={180}
              height={225}
              className="h-full w-full object-cover"
            />
          ) : (
            <GenreArt
              style={patternStyle}
              seed={patternSeed}
              accentFrom={accentFrom}
              accentTo={accentTo}
              className="h-full w-full"
            />
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {GENRE_PATTERN_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setPatternStyle(style)}
              className={cn(
                "rounded-input border p-1.5 text-center transition-colors",
                patternStyle === style
                  ? "border-accent/60 bg-accent/10"
                  : "border-border bg-background hover:border-accent/30",
              )}
            >
              <span className="block aspect-[4/5] overflow-hidden rounded-input border border-border">
                <GenreArt
                  style={style}
                  seed={genreSeedFromName(style)}
                  accentFrom={accentFrom}
                  accentTo={accentTo}
                  className="h-full w-full"
                />
              </span>
              <span className="mt-1 block text-[11px] font-medium text-muted">
                {GENRE_PATTERN_LABELS[style]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Descripción</label>
        <textarea
          className="min-h-20 w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ColorPickerField
          label="Color inicio"
          value={accentFrom}
          onChange={setAccentFrom}
        />
        <ColorPickerField
          label="Color fin"
          value={accentTo}
          onChange={setAccentTo}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={pending} className="self-start">
        <Save className="size-4" aria-hidden />
        {submitLabel}
      </Button>
    </form>
  );
}
