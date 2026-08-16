"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { adminCreateBadge, adminUpdateBadge } from "@/server/actions/admin";
import type { AdminActionResult } from "@/server/actions/admin";
import type { Badge } from "@/types/badge";

interface BadgeFormProps {
  initial?: Badge;
  submitLabel: string;
}

export function BadgeForm({ initial, submitLabel }: BadgeFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const input = {
      slug: slug.trim(),
      name: name.trim(),
      image: image.trim(),
      description: description.trim(),
    };

    startTransition(async () => {
      const result: AdminActionResult = initial
        ? await adminUpdateBadge(initial.id, input)
        : await adminCreateBadge(input);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nombre"
          placeholder="Pionero"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          label="Slug (URL)"
          placeholder="pionero"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
      </div>
      <Input
        label="Imagen de la medalla (URL)"
        placeholder="https://..."
        value={image}
        onChange={(event) => setImage(event.target.value)}
        required
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Descripción</label>
        <textarea
          className="min-h-20 w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Qué logra esta medalla…"
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
