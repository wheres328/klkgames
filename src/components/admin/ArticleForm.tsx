"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { adminCreateArticle, adminUpdateArticle } from "@/server/actions/admin";
import type { AdminActionResult } from "@/server/actions/admin";
import type { AdminArticle, AdminTag } from "@/server/services/adminService";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface ArticleFormProps {
  games: Option[];
  tags: AdminTag[];
  authorId: string;
  initial?: AdminArticle;
  submitLabel: string;
}

const inputSelectClass =
  "h-10 w-full rounded-input border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30";
const textareaClass =
  "w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30";

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex max-h-44 flex-wrap content-start gap-1.5 overflow-y-auto rounded-input border border-border bg-background/60 p-2.5">
        {options.length === 0 ? (
          <p className="py-1 text-xs text-muted">No hay opciones disponibles.</p>
        ) : (
          options.map((option) => (
            <label
              key={option.id}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted transition-colors has-[:checked]:border-accent/50 has-[:checked]:bg-accent/10 has-[:checked]:text-accent-2"
            >
              <input
                type="checkbox"
                className="accent-accent"
                checked={selected.includes(option.id)}
                onChange={() => toggle(option.id)}
              />
              {option.name}
            </label>
          ))
        )}
      </div>
    </div>
  );
}

export function ArticleForm({ games, tags, authorId, initial, submitLabel }: ArticleFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [content, setContent] = useState(initial?.content.join("\n") ?? "");
  const [readTime, setReadTime] = useState(initial?.readTime ?? 5);
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [relatedGameIds, setRelatedGameIds] = useState<string[]>(initial?.relatedGameIds ?? []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const input = {
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      image: image.trim(),
      category: category.trim(),
      content: splitLines(content),
      readTime,
      status,
      authorId,
      tagIds,
      relatedGameIds,
    };

    startTransition(async () => {
      const result: AdminActionResult = initial
        ? await adminUpdateArticle(initial.id, input)
        : await adminCreateArticle(input);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Información
        </h3>
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Título"
              placeholder="Los mejores juegos de 2026"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <Input
              label="Slug (URL)"
              placeholder="mejores-juegos-2026"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Imagen (URL)"
              placeholder="https://..."
              value={image}
              onChange={(event) => setImage(event.target.value)}
              required
            />
            <Input
              label="Categoría"
              placeholder="Editorial"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Extracto</label>
            <textarea
              className={cn(textareaClass, "min-h-20")}
              placeholder="Resumen breve mostrado en tarjetas y listados."
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Contenido (un párrafo por línea)
            </label>
            <textarea
              className={cn(textareaClass, "min-h-48")}
              placeholder={"Introducción del artículo.\n\nDesarrollo.\n\nConclusión."}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="articleReadTime" className="text-sm font-medium text-foreground">
                Tiempo de lectura (minutos)
              </label>
              <input
                id="articleReadTime"
                type="number"
                min={0}
                max={600}
                className={inputSelectClass}
                value={readTime}
                onChange={(event) => setReadTime(Number(event.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="articleStatus" className="text-sm font-medium text-foreground">
                Estado
              </label>
              <select
                id="articleStatus"
                className={inputSelectClass}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Relaciones
        </h3>
        <div className="grid gap-4">
          <CheckboxGroup label="Etiquetas" options={tags} selected={tagIds} onChange={setTagIds} />
          <CheckboxGroup
            label="Juegos relacionados"
            options={games}
            selected={relatedGameIds}
            onChange={setRelatedGameIds}
          />
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          <Save className="size-4" aria-hidden />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
