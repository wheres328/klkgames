"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Medal, X } from "lucide-react";
import type { Badge, UserBadgeView } from "@/types/badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { awardBadgeAction, revokeBadgeAction } from "@/server/actions/profile";

interface BadgeAwardPanelProps {
  userId: string;
  username: string;
  available: Badge[];
  earned: UserBadgeView[];
}

export function BadgeAwardPanel({ userId, username, available, earned }: BadgeAwardPanelProps) {
  const [badgeId, setBadgeId] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAward = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!badgeId || pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await awardBadgeAction(userId, { badgeId, reason });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({ title: "Medalla otorgada", description: `A ${username}`, variant: "success" });
      setBadgeId("");
      setReason("");
      router.refresh();
    } catch {
      setError("Error al otorgar la medalla.");
    } finally {
      setPending(false);
    }
  };

  const handleRevoke = async (badgeIdToRevoke: string, badgeName: string) => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await revokeBadgeAction(userId, badgeIdToRevoke);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({ title: "Medalla retirada", description: badgeName, variant: "info" });
      router.refresh();
    } catch {
      setError("Error al retirar la medalla.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-card border border-accent/30 bg-surface p-5">
      <h2 className="font-display flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
        <Award className="size-4 text-accent" aria-hidden />
        Otorgar medallas
      </h2>
      <p className="mt-1 text-xs text-muted">
        Modera la bóveda de <span className="font-semibold text-foreground">@{username}</span>.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={handleAward} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Medalla</label>
          {available.length === 0 ? (
            <p className="rounded-input border border-border bg-surface-raised px-3 py-2 text-xs text-muted">
              No quedan medallas sin otorgar.
            </p>
          ) : (
            <select
              value={badgeId}
              onChange={(event) => setBadgeId(event.target.value)}
              className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="" disabled>
                Selecciona una medalla…
              </option>
              {available.map((badge) => (
                <option key={badge.id} value={badge.id}>
                  {badge.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Motivo (opcional)</label>
          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="p. ej. Contribución destacada"
            maxLength={300}
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <Button type="submit" size="sm" disabled={!badgeId} loading={pending} className="self-start">
          <Award className="size-4" aria-hidden />
          Otorgar
        </Button>
      </form>

      {earned.length > 0 ? (
        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
            <Medal className="size-3.5" aria-hidden />
            Otorgadas
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {earned.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-input border border-border/60 bg-surface-raised px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.badge.name}
                  </p>
                  {item.reason ? (
                    <p className="truncate text-xs text-muted">«{item.reason}»</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(item.badge.id, item.badge.name)}
                  disabled={pending}
                  className="flex size-7 shrink-0 items-center justify-center rounded-input text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                  aria-label={`Retirar medalla ${item.badge.name}`}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
