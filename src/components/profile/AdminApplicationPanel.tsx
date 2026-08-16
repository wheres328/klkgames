"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, HandHeart, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { submitAdminApplicationAction } from "@/server/actions/reputation";

interface ApplicationView {
  status: string;
  message: string;
  reviewNote: string | null;
  reputationAtSubmit: number;
  createdAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
}

interface AdminApplicationPanelProps {
  isStaff: boolean;
  application: ApplicationView | null;
  reputation: number;
  minReputation: number;
  isOwnProfile: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function AdminApplicationPanel({
  isStaff,
  application,
  reputation,
  minReputation,
  isOwnProfile,
}: AdminApplicationPanelProps) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  if (!isOwnProfile || isStaff) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await submitAdminApplicationAction(message);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({
        title: "Postulación enviada",
        description: "El equipo revisará tu solicitud.",
        variant: "success",
      });
      setMessage("");
      router.refresh();
    } catch {
      setError("Error al enviar la postulación.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <h2 className="font-display flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
        <HandHeart className="size-4 text-accent" aria-hidden />
        Únete al equipo
      </h2>

      {application ? (
        <div className="mt-3 space-y-3 text-sm">
          <div
            className={
              application.status === "APPROVED"
                ? "flex items-center gap-2 rounded-input border border-success/40 bg-success/10 px-3 py-2 text-success"
                : application.status === "REJECTED"
                  ? "flex items-center gap-2 rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-danger"
                  : "flex items-center gap-2 rounded-input border border-warning/40 bg-warning/10 px-3 py-2 text-warning"
            }
          >
            {application.status === "APPROVED" ? (
              <CheckCircle2 className="size-4" aria-hidden />
            ) : application.status === "REJECTED" ? (
              <XCircle className="size-4" aria-hidden />
            ) : (
              <Clock className="size-4" aria-hidden />
            )}
            <span>
              {application.status === "APPROVED"
                ? "¡Aprobada! Bienvenido al equipo."
                : application.status === "REJECTED"
                  ? "Tu postulación fue rechazada."
                  : "Postulación en revisión."}
            </span>
          </div>
          <p className="text-muted">
            <span className="font-semibold text-foreground">Enviada el {formatDate(application.createdAt)}</span>{" "}
            con {application.reputationAtSubmit} puntos de reputación.
          </p>
          {application.message ? (
            <blockquote className="rounded-input border-l-2 border-accent bg-surface-raised px-3 py-2 text-muted">
              {application.message}
            </blockquote>
          ) : null}
          {application.status === "REJECTED" && application.reviewNote ? (
            <p className="rounded-input border border-border bg-surface-raised px-3 py-2 text-muted">
              <span className="font-semibold text-foreground">Motivo del equipo:</span>{" "}
              {application.reviewNote}
            </p>
          ) : null}
          {application.status === "APPROVED" && application.reviewerName ? (
            <p className="text-xs text-muted">
              Revisada por <span className="font-semibold text-foreground">{application.reviewerName}</span>.
            </p>
          ) : null}
        </div>
      ) : reputation >= minReputation ? (
        <>
          <p className="mt-1 text-xs text-muted">
            Con {minReputation} puntos de reputación puedes postularte para moderar la comunidad.
          </p>
          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          ) : null}
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Cuéntanos por qué quieres ayudar a mantener el sitio."
              maxLength={2000}
              rows={4}
              required
              className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <Button type="submit" size="sm" loading={pending} className="self-start">
              <Send className="size-4" aria-hidden />
              Enviar postulación
            </Button>
          </form>
        </>
      ) : (
        <p className="mt-2 text-xs text-muted">
          Gana al menos <span className="font-semibold text-foreground">{minReputation}</span> puntos de
          reputación para postularte al equipo. Llevas{" "}
          <span className="font-semibold text-foreground">{reputation}</span>.
        </p>
      )}
    </div>
  );
}
