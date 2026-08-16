"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { adminCreatePlatform, adminUpdatePlatform } from "@/server/actions/admin";
import type { AdminActionResult } from "@/server/actions/admin";
import type { Platform } from "@/types/platform";

interface PlatformFormProps {
  initial?: Platform;
  submitLabel: string;
}

export function PlatformForm({ initial, submitLabel }: PlatformFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [shortName, setShortName] = useState(initial?.shortName ?? "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const input = {
      slug: slug.trim(),
      name: name.trim(),
      shortName: shortName.trim(),
    };

    startTransition(async () => {
      const result: AdminActionResult = initial
        ? await adminUpdatePlatform(initial.id, input)
        : await adminCreatePlatform(input);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Nombre"
        placeholder="PlayStation 5"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Slug (URL)"
          placeholder="playstation-5"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
        <Input
          label="Nombre corto"
          placeholder="PS5"
          value={shortName}
          onChange={(event) => setShortName(event.target.value)}
          required
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
