"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import type { UserSummary } from "@/types/user";
import { useToast } from "@/components/ui/Toast";
import { rateGameAction, removeRatingAction } from "@/server/actions/rating";
import { cn } from "@/lib/utils";

export interface RateGameBoxProps {
  gameId: string;
  gameName: string;
  currentRating: number;
  ratingCount: number;
  currentUser?: UserSummary | null;
  myRating?: number | null;
}

export function RateGameBox({
  gameId,
  gameName,
  currentRating,
  ratingCount,
  currentUser = null,
  myRating = null,
}: RateGameBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(myRating ?? 0);
  const [submitted, setSubmitted] = useState<number | null>(myRating);
  const [hover, setHover] = useState(0);
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  const active = hover || value;

  const selectStar = (star: number) => {
    if (!currentUser) {
      toast({ title: "Inicia sesión para valorar el juego.", variant: "info" });
      return;
    }
    setValue(star);
  };

  const submit = async () => {
    if (!currentUser || value === 0 || pending) return;
    setPending(true);
    try {
      const result = await rateGameAction({ gameId, value });
      if (result.ok) {
        setSubmitted(value);
        toast({
          title: "Valoración enviada",
          description: `Has puntuado ${gameName} con ${value} de 5 estrellas.`,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({ title: result.error, variant: "error" });
      }
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    if (!currentUser || submitted === null || pending) return;
    setPending(true);
    try {
      const result = await removeRatingAction({ gameId });
      if (result.ok) {
        setSubmitted(null);
        setValue(0);
        toast({
          title: "Valoración eliminada",
          description: `Tu valoración de ${gameName} se ha retirado.`,
          variant: "info",
        });
        router.refresh();
      } else {
        toast({ title: result.error, variant: "error" });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface/50 p-6 text-center">
      <p className="text-sm font-medium text-foreground">¿Juegas a {gameName}?</p>
      <p className="text-xs text-muted">
        Valoración media {currentRating.toFixed(1)} sobre {ratingCount.toLocaleString("es-ES")}{" "}
        reseñas.
      </p>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Valorar juego"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(star)}
            onClick={() => selectStar(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                star <= active ? "fill-warning text-warning" : "text-border",
              )}
              aria-hidden
            />
          </button>
        ))}
      </div>
      {currentUser ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={value === 0 || pending}
            onClick={submit}
            className="rounded-card bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Enviar valoración"}
          </button>
          {submitted !== null && (
            <button
              type="button"
              disabled={pending}
              onClick={remove}
              className="rounded-card border border-border px-5 py-2 text-sm font-semibold text-muted transition-colors hover:border-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quitar valoración
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted">Inicia sesión para valorar el juego.</p>
      )}
    </div>
  );
}
