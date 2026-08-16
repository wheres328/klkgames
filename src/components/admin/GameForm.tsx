"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { adminCreateGame, adminUpdateGame } from "@/server/actions/admin";
import type { AdminActionResult } from "@/server/actions/admin";
import type { AdminGame, AdminRequirementSet } from "@/server/services/adminService";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface GameFormProps {
  genres: Option[];
  platforms: Option[];
  initial?: AdminGame;
  submitLabel: string;
}

const inputSelectClass =
  "h-10 w-full rounded-input border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30";
const textareaClass =
  "w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30";
const checkboxGroupClass =
  "flex max-h-44 flex-wrap content-start gap-1.5 overflow-y-auto rounded-input border border-border bg-background/60 p-2.5";

const STORE_OPTIONS = [
  { value: "STEAM", label: "Steam" },
  { value: "GOG", label: "GOG" },
  { value: "EPIC", label: "Epic Games" },
  { value: "MICROSOFT", label: "Microsoft Store" },
  { value: "PLAYSTATION", label: "PlayStation Store" },
  { value: "XBOX", label: "Microsoft Store (Xbox)" },
  { value: "NINTENDO", label: "Nintendo eShop" },
  { value: "OFFICIAL", label: "Web oficial" },
  { value: "OTHER", label: "Otro" },
];

interface DownloadRow {
  store: string;
  name: string;
  url: string;
}

type RequirementState = Omit<AdminRequirementSet, "vram" | "directx">;

function emptyRequirements(): RequirementState {
  return { os: "", cpu: "", gpu: "", ram: "", storage: "" };
}

function toDateInput(date: Date): string {
  return `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(2, "0")}-${`${date.getUTCDate()}`.padStart(2, "0")}`;
}

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
      <div className={checkboxGroupClass}>
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

function RequirementFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: RequirementState;
  onChange: (next: RequirementState) => void;
}) {
  const set = (key: keyof RequirementState) => (field: string) =>
    onChange({ ...value, [key]: field });

  return (
    <div className="flex flex-col gap-4 rounded-input border border-border bg-background/60 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Sistema operativo" placeholder="Windows 10 64 bits" value={value.os} onChange={(event) => set("os")(event.target.value)} />
        <Input label="Procesador" placeholder="Intel Core i5-6600K" value={value.cpu} onChange={(event) => set("cpu")(event.target.value)} />
        <Input label="Tarjeta gráfica" placeholder="NVIDIA GTX 1060 6 GB" value={value.gpu} onChange={(event) => set("gpu")(event.target.value)} />
        <Input label="Memoria RAM" placeholder="8 GB" value={value.ram} onChange={(event) => set("ram")(event.target.value)} />
        <Input label="Almacenamiento" placeholder="40 GB disponibles" value={value.storage} onChange={(event) => set("storage")(event.target.value)} />
      </div>
    </div>
  );
}

export function GameForm({ genres, platforms, initial, submitLabel }: GameFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [developer, setDeveloper] = useState(initial?.developer ?? "");
  const [publisher, setPublisher] = useState(initial?.publisher ?? "");
  const [releaseDate, setReleaseDate] = useState(initial ? toDateInput(initial.releaseDate) : todayISO());
  const [status, setStatus] = useState(initial?.status ?? "RELEASED");
  const [publish, setPublish] = useState(initial?.publishStatus === "PUBLISHED" || false);

  const [description, setDescription] = useState(initial?.description ?? "");
  const [longDescription, setLongDescription] = useState(initial?.longDescription ?? "");

  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [screenshotsText, setScreenshotsText] = useState(initial?.screenshots.join("\n") ?? "");

  const [minimum, setMinimum] = useState<RequirementState>(
    initial?.requirements.minimum ?? emptyRequirements(),
  );
  const [recommended, setRecommended] = useState<RequirementState>(
    initial?.requirements.recommended ?? emptyRequirements(),
  );

  const [downloads, setDownloads] = useState<DownloadRow[]>(
    initial?.downloads.map((download) => ({
      store: download.store,
      name: download.name,
      url: download.url,
    })) ?? [],
  );
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [zipPassword, setZipPassword] = useState(initial?.zipPassword ?? "");

  const [genreIds, setGenreIds] = useState<string[]>(initial?.genreIds ?? []);
  const [platformIds, setPlatformIds] = useState<string[]>(initial?.platformIds ?? []);

  const updateDownload = (index: number, patch: Partial<DownloadRow>) => {
    setDownloads((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const removeDownload = (index: number) => {
    setDownloads((rows) => rows.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const input = {
      slug: slug.trim() || slugify(name),
      name: name.trim(),
      description: description.trim(),
      longDescription: longDescription.trim(),
      developer: developer.trim(),
      publisher: publisher.trim() || developer.trim(),
      releaseDate: releaseDate || todayISO(),
      status,
      publishStatus: publish ? ("PUBLISHED" as const) : ("DRAFT" as const),
      genreIds,
      platformIds,
      coverUrl: coverUrl.trim(),
      screenshots: splitLines(screenshotsText),
      videoUrl: videoUrl.trim(),
      downloads: downloads
        .map((download) => ({
          store: download.store,
          name: download.name.trim(),
          url: download.url.trim(),
        }))
        .filter((download) => download.name && download.url),
      requirements: { minimum, recommended },
      zipPassword: zipPassword.trim(),
    };

    startTransition(async () => {
      const result: AdminActionResult = initial
        ? await adminUpdateGame(initial.id, input)
        : await adminCreateGame(input);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Datos básicos
        </h3>
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nombre"
              placeholder="War Thunder"
              value={name}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);
                if (!slugTouched) setSlug(slugify(value));
              }}
              required
            />
            <Input
              label="Slug (URL)"
              placeholder="war-thunder"
              hint="Se genera solo desde el nombre; puedes editarlo"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Desarrollador"
              placeholder="Gaijin Entertainment"
              value={developer}
              onChange={(event) => setDeveloper(event.target.value)}
              required
            />
            <Input
              label="Editor"
              hint="Si lo dejas vacío se usa el desarrollador"
              placeholder="Gaijin Distribution"
              value={publisher}
              onChange={(event) => setPublisher(event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="releaseDate" className="text-sm font-medium text-foreground">
                Fecha de lanzamiento
              </label>
              <input
                id="releaseDate"
                type="date"
                className={inputSelectClass}
                value={releaseDate}
                onChange={(event) => setReleaseDate(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gameStatus" className="text-sm font-medium text-foreground">
                Estado comercial
              </label>
              <select
                id="gameStatus"
                className={inputSelectClass}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="RELEASED">Lanzado</option>
                <option value="EARLY_ACCESS">Acceso anticipado</option>
                <option value="UPCOMING">Próximamente</option>
                <option value="DEMO">Demo</option>
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                className="size-4 accent-accent"
                checked={publish}
                onChange={(event) => setPublish(event.target.checked)}
              />
              Publicar (visible en la tienda)
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <CheckboxGroup
              label="Géneros"
              options={genres}
              selected={genreIds}
              onChange={setGenreIds}
            />
            <CheckboxGroup
              label="Plataformas"
              options={platforms}
              selected={platformIds}
              onChange={setPlatformIds}
            />
          </div>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Descripción
        </h3>
        <div className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Descripción corta
            </label>
            <textarea
              className={cn(textareaClass, "min-h-20")}
              placeholder="Resumen de una línea para tarjetas y listados."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Descripción larga
            </label>
            <textarea
              className={cn(textareaClass, "min-h-40")}
              placeholder="Ficha completa del juego."
              value={longDescription}
              onChange={(event) => setLongDescription(event.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Fotos
        </h3>
        <div className="grid gap-4">
          <Input
            label="Portada (URL)"
            placeholder="https://..."
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Capturas (una URL por línea)
            </label>
            <textarea
              className={cn(textareaClass, "min-h-28")}
              placeholder={"https://...\nhttps://..."}
              value={screenshotsText}
              onChange={(event) => setScreenshotsText(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Especificaciones
        </h3>
        <div className="grid gap-4">
          <RequirementFields title="Mínimas" value={minimum} onChange={setMinimum} />
          <RequirementFields title="Recomendadas" value={recommended} onChange={setRecommended} />
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Enlaces de descarga
        </h3>
        <div className="flex flex-col gap-3">
          {downloads.length === 0 ? (
            <p className="text-xs text-muted">Añade enlaces a Steam, GOG, web oficial, etc.</p>
          ) : (
            downloads.map((download, index) => (
              <div
                key={index}
                className="flex flex-wrap items-end gap-3 rounded-input border border-border bg-background/60 p-3"
              >
                <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">Tienda</label>
                  <select
                    className={inputSelectClass}
                    value={download.store}
                    onChange={(event) => updateDownload(index, { store: event.target.value })}
                  >
                    {STORE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">Nombre</label>
                  <Input
                    placeholder="Comprar en Steam"
                    value={download.name}
                    onChange={(event) => updateDownload(index, { name: event.target.value })}
                  />
                </div>
                <div className="flex min-w-52 flex-[2] flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">Enlace (URL)</label>
                  <Input
                    placeholder="https://store.steampowered.com/..."
                    value={download.url}
                    onChange={(event) => updateDownload(index, { url: event.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="icon-sm"
                  aria-label={`Quitar descarga ${index + 1}`}
                  onClick={() => removeDownload(index)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))
          )}
          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDownloads((rows) => [...rows, { store: "STEAM", name: "", url: "" }])}
            >
              <Plus className="size-4" aria-hidden />
              Añadir enlace
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Instalación
        </h3>
        <Input
          label="Contraseña de los ZIP"
          placeholder="P.ej. vortex2026"
          hint="Se muestra en la ficha del juego (paso 3 de la instalación). Déjalo vacío si los ZIP no llevan contraseña."
          value={zipPassword}
          onChange={(event) => setZipPassword(event.target.value)}
        />
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="font-display mb-4 text-sm font-bold tracking-tight text-foreground">
          Vídeo
        </h3>
        <Input
          label="Vídeo (URL opcional)"
          placeholder="https://www.youtube.com/watch?v=..."
          hint="Tráiler o gameplay (YouTube, Vimeo, etc.)"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
        />
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
