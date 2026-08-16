"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SiteSettings } from "@/server/services/siteSettingsService";
import { adminUpdateSiteSettings } from "@/server/actions/adminSettings";

function ImagePreview({ url, label }: { url: string; label: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!url) return null;

  const failed = failedUrl === url;

  return (
    <div className="mt-1.5 flex items-center gap-2.5 text-xs text-muted">
      {failed ? (
        <span className="rounded-input border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-warning">
          No se pudo cargar la imagen. Usa un enlace directo que termine en .png, .jpg, .webp, etc.
        </span>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            width={48}
            height={48}
            className="max-h-12 max-w-20 rounded-input border border-border object-contain"
            onError={() => setFailedUrl(url)}
          />
          <span>Vista previa de {label}</span>
        </>
      )}
    </div>
  );
}

export interface SiteSettingsFormProps {
  settings: SiteSettings;
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [description, setDescription] = useState(settings.description);
  const [url, setUrl] = useState(settings.url);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl ?? "");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail ?? "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await adminUpdateSiteSettings({
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        url: url.trim(),
        logoUrl: logoUrl.trim(),
        faviconUrl: faviconUrl.trim(),
        contactEmail: contactEmail.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nombre del sitio" value={name} onChange={(event) => setName(event.target.value)} required />
        <Input label="Eslogan" value={tagline} onChange={(event) => setTagline(event.target.value)} hint="Aparece bajo el nombre en la cabecera." />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Descripción</label>
        <textarea
          className="min-h-24 w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>

      <Input
        label="URL del sitio"
        type="url"
        placeholder="https://tudominio.com"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        hint="Se usa en metadatos y enlaces canónicos."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Input
            label="Logo (URL de imagen)"
            type="url"
            placeholder="https://..."
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            hint="Se muestra en la cabecera y el pie. Vacío usa el icono por defecto."
          />
          <ImagePreview url={logoUrl} label="logo" />
        </div>
        <div>
          <Input
            label="Favicon (URL de imagen)"
            type="url"
            placeholder="https://..."
            value={faviconUrl}
            onChange={(event) => setFaviconUrl(event.target.value)}
            hint="Icono de la pestaña del navegador. Vacío usa el favicon del sitio."
          />
          <ImagePreview url={faviconUrl} label="favicon" />
        </div>
      </div>

      <Input
        label="Correo de contacto"
        type="email"
        placeholder="contacto@tudominio.com"
        value={contactEmail}
        onChange={(event) => setContactEmail(event.target.value)}
        hint="Se muestra en la página de contacto."
      />

      {error ? (
        <p role="alert" className="rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {saved ? (
        <p role="status" className="rounded-input border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          Ajustes guardados.
        </p>
      ) : null}

      <Button type="submit" loading={pending} className="self-start">
        <Save className="size-4" aria-hidden />
        Guardar ajustes
      </Button>
    </form>
  );
}
