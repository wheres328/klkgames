"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import type { Donation } from "@/types/donation";
import { DONATION_PLATFORM_LABELS } from "@/components/admin/constants";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  createDonationAction,
  deleteDonationAction,
  updateDonationAction,
} from "@/server/actions/adminDonations";

interface DonationEditorProps {
  donation?: Donation;
}

const inputClass =
  "w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

const platformHints: Record<string, string> = {
  PATREON: "https://www.patreon.com/tunombre",
  PAYPAL: "https://www.paypal.com/paypalme/tunombre",
  CRYPTO: "https://link al explorador o instrucciones",
};

export function DonationEditor({ donation }: DonationEditorProps) {
  const isEdit = Boolean(donation);
  const [platform, setPlatform] = useState(donation?.platform ?? "PATREON");
  const [url, setUrl] = useState(donation?.url ?? "");
  const [label, setLabel] = useState(donation?.label ?? "");
  const [address, setAddress] = useState(donation?.address ?? "");
  const [order, setOrder] = useState(String(donation?.order ?? 0));
  const [active, setActive] = useState(donation?.active ?? true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const payload = {
        platform,
        url,
        label: label || undefined,
        address: address || undefined,
        order: Number(order) || 0,
        active,
      };
      const result = isEdit
        ? await updateDonationAction({ ...payload, id: donation!.id })
        : await createDonationAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({
        title: isEdit ? "Donación actualizada" : "Donación creada",
        variant: "success",
      });
      if (!isEdit) {
        setUrl("");
        setLabel("");
        setAddress("");
        setOrder("0");
        setActive(true);
      }
      router.refresh();
    } catch {
      setError("Error al guardar la donación.");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!donation || pending) return;
    if (!window.confirm("¿Eliminar esta donación?")) return;
    setPending(true);
    setError(null);
    try {
      const result = await deleteDonationAction(donation.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({ title: "Donación eliminada", variant: "info" });
      router.refresh();
    } catch {
      setError("Error al eliminar la donación.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-border bg-surface p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Plataforma</label>
          <select
            value={platform}
            onChange={(event) => setPlatform(event.target.value as Donation["platform"])}
            className={inputClass}
          >
            {Object.entries(DONATION_PLATFORM_LABELS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Enlace</label>
          <input
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={platformHints[platform]}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Etiqueta del botón (opcional)</label>
          <input
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="p. ej. Apóyanos en Patreon"
            maxLength={80}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            {platform === "CRYPTO" ? "Dirección de la billetera" : "Dato de pago"} (opcional)
          </label>
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder={
              platform === "CRYPTO"
                ? "Dirección de la billetera (USDT, BTC…)"
                : "Email o referencia de pago"
            }
            maxLength={300}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Orden (más bajo primero)</label>
          <input
            type="number"
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            min={0}
            max={1000}
            className={inputClass}
          />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex h-9 cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Visible en el sitio
          </label>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" size="sm" loading={pending}>
          {isEdit ? <Save className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {isEdit ? "Guardar cambios" : "Crear donación"}
        </Button>
        {isEdit ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            disabled={pending}
            className="text-danger hover:bg-danger/10"
          >
            <Trash2 className="size-4" aria-hidden />
            Eliminar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
