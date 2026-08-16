"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import type { RankView } from "@/server/services/rankService";
import { PERMISSION_CATALOG, PERMISSION_GROUPS } from "@/types/permissions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createRankAction, deleteRankAction, updateRankAction } from "@/server/actions/adminRanks";
import { cn } from "@/lib/utils";

interface RankEditorProps {
  rank?: RankView;
}

const inputClass =
  "w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function RankEditor({ rank }: RankEditorProps) {
  const isEdit = Boolean(rank);
  const [name, setName] = useState(rank?.name ?? "");
  const [description, setDescription] = useState(rank?.description ?? "");
  const [color, setColor] = useState(rank?.color ?? "");
  const [isDefault, setIsDefault] = useState(rank?.isDefault ?? false);
  const [permissions, setPermissions] = useState<string[]>(rank?.permissions ?? []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const togglePermission = (code: string) => {
    setPermissions((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const payload = {
        name,
        description: description || undefined,
        color: color || undefined,
        permissions,
        isDefault,
      };
      const result = isEdit
        ? await updateRankAction({ ...payload, id: rank!.id })
        : await createRankAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({
        title: isEdit ? "Rango actualizado" : "Rango creado",
        variant: "success",
      });
      if (!isEdit) {
        setName("");
        setDescription("");
        setColor("");
        setPermissions([]);
        setIsDefault(false);
      }
      router.refresh();
    } catch {
      setError("Error al guardar el rango.");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!rank || pending) return;
    if (!window.confirm(`¿Eliminar el rango "${rank.name}"?`)) return;
    setPending(true);
    setError(null);
    try {
      const result = await deleteRankAction(rank.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({ title: "Rango eliminado", variant: "info" });
      router.refresh();
    } catch {
      setError("Error al eliminar el rango.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-border bg-surface p-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="p. ej. Colaborador"
            maxLength={50}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Color del rango (opcional)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#ffffff"}
              onChange={(event) => setColor(event.target.value)}
              className="h-9 w-10 shrink-0 cursor-pointer rounded-input border border-border bg-surface"
              aria-label="Color del rango"
            />
            <input
              type="text"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="#ff6600"
              maxLength={7}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex items-end">
          <label
            className={cn(
              "flex h-9 cursor-pointer items-center gap-2 text-sm font-medium text-foreground",
              rank?.isDefault && "cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="checkbox"
              checked={isDefault}
              disabled={rank?.isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Rango por defecto
          </label>
        </div>
      </div>

      <div className="mt-3">
        <label className={labelClass}>Descripción (opcional)</label>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Breve descripción del rango"
          maxLength={300}
          className={inputClass}
        />
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium text-foreground">
          Permisos <span className="text-xs font-normal text-muted">({permissions.length} seleccionados)</span>
        </legend>
        <div className="space-y-3 rounded-input border border-border/60 bg-surface-raised/60 p-3">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group}>
              <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                {group}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {PERMISSION_CATALOG.filter((permission) => permission.group === group).map(
                  (permission) => (
                    <label
                      key={permission.code}
                      className="flex cursor-pointer items-center gap-1.5 rounded-input border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(permission.code)}
                        onChange={() => togglePermission(permission.code)}
                        className="size-3.5 accent-[var(--accent)]"
                      />
                      {permission.label}
                    </label>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

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
          {isEdit ? "Guardar cambios" : "Crear rango"}
        </Button>
        {isEdit ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            disabled={pending || rank?.isDefault}
            className="text-danger hover:bg-danger/10 disabled:opacity-50"
            title={rank?.isDefault ? "No se puede eliminar el rango por defecto" : "Eliminar rango"}
          >
            <Trash2 className="size-4" aria-hidden />
            Eliminar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
