"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ColorPickerField } from "@/components/ui/ColorPickerField";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { SOCIAL_ICON_LABELS, SOCIAL_ICON_KEYS } from "@/server/validation/siteSettingsValidation";
import { adminCreateSocialLink, adminUpdateSocialLink } from "@/server/actions/adminSettings";
import type { SocialLinkView } from "@/server/services/siteSettingsService";
import { cn } from "@/lib/utils";

export interface SocialLinkFormProps {
  initial?: SocialLinkView;
  submitLabel: string;
}

export function SocialLinkForm({ initial, submitLabel }: SocialLinkFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "web");
  const [color, setColor] = useState(initial?.color ?? "#7c3aed");
  const [order, setOrder] = useState(initial ? String(initial.order) : "0");
  const [visible, setVisible] = useState(initial?.visible ?? true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const input = {
      name: name.trim(),
      url: url.trim(),
      icon,
      color: color.trim(),
      order: order.trim(),
      visible,
    };

    startTransition(async () => {
      const result = initial
        ? await adminUpdateSocialLink(initial.id, input)
        : await adminCreateSocialLink(input);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nombre"
          placeholder="YouTube"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          label="URL"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Icono</label>
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-input border border-border bg-surface text-foreground">
              <SocialIcon icon={icon} className="size-5" />
            </span>
            <select
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              className="h-10 w-full rounded-input border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {SOCIAL_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {SOCIAL_ICON_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Input
          label="Orden"
          type="number"
          min={0}
          max={99}
          value={order}
          onChange={(event) => setOrder(event.target.value)}
          hint="Menor aparece primero."
        />
      </div>

      <ColorPickerField label="Color del icono" value={color} onChange={setColor} />

      <label className={cn("flex items-center gap-2 text-sm text-foreground")}>
        <input
          type="checkbox"
          checked={visible}
          onChange={(event) => setVisible(event.target.checked)}
          className="size-4 rounded-input border border-border accent-accent"
        />
        Visible en el pie de página
      </label>

      {error ? (
        <p role="alert" className="rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
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
