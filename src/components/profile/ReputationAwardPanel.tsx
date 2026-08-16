"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { adjustReputationAction } from "@/server/actions/reputation";

interface ReputationAwardPanelProps {
  userId: string;
  username: string;
  currentPoints: number;
}

export function ReputationAwardPanel({
  userId,
  username,
  currentPoints,
}: ReputationAwardPanelProps) {
  const [delta, setDelta] = useState("5");
  const [note, setNote] = useState("");
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
      const value = Number(delta);
      if (!Number.isInteger(value) || value === 0 || value < -100 || value > 100) {
        setError("El ajuste debe ser un número entero entre -100 y 100, distinto de 0.");
        return;
      }
      const result = await adjustReputationAction({ userId, delta: value, note: note || undefined });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({
        title: "Reputación ajustada",
        description: value > 0 ? `+${value} a @${username}` : `${value} a @${username}`,
        variant: "success",
      });
      setNote("");
      router.refresh();
    } catch {
      setError("Error al ajustar la reputación.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-card border border-accent/30 bg-surface p-5">
      <h2 className="font-display flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
        <Plus className="size-4 text-accent" aria-hidden />
        Ajustar reputación
      </h2>
      <p className="mt-1 text-xs text-muted">
        Actual: <span className="font-semibold text-foreground">{currentPoints} puntos</span> para{" "}
        <span className="font-semibold text-foreground">@{username}</span>.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDelta(String(Math.max(-100, (Number(delta) || 0) - 1)))}
            className="flex h-10 items-center justify-center rounded-input border border-border bg-surface text-muted transition-colors hover:border-danger/40 hover:text-danger"
            aria-label="Restar 1 punto"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="rep-delta" className="sr-only">
              Puntos
            </label>
            <input
              id="rep-delta"
              type="number"
              value={delta}
              onChange={(event) => setDelta(event.target.value)}
              step={1}
              min={-100}
              max={100}
              className="h-10 w-full rounded-input border border-border bg-surface px-3 text-center text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="button"
              onClick={() => setDelta(String(Math.min(100, (Number(delta) || 0) + 1)))}
              className="flex size-10 shrink-0 items-center justify-center rounded-input border border-border bg-surface text-muted transition-colors hover:border-accent/40 hover:text-accent"
              aria-label="Sumar 1 punto"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="rep-note" className="mb-1.5 block text-sm font-medium text-foreground">
            Motivo (opcional)
          </label>
          <input
            id="rep-note"
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="p. ej. Reporte confirmado"
            maxLength={300}
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <Button type="submit" size="sm" loading={pending} className="self-start">
          Aplicar
        </Button>
      </form>
    </div>
  );
}
