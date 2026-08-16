"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { reviewAdminApplicationAction } from "@/server/actions/reputation";

interface ApplicationReviewButtonsProps {
  applicationId: string;
}

export function ApplicationReviewButtons({ applicationId }: ApplicationReviewButtonsProps) {
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handle = async (decision: "APPROVE" | "REJECT") => {
    if (pending) return;
    setPending(decision === "APPROVE" ? "approve" : "reject");
    setError(null);
    try {
      const result = await reviewAdminApplicationAction({
        applicationId,
        decision,
        note: note.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({
        title: decision === "APPROVE" ? "Postulación aprobada" : "Postulación rechazada",
        variant: decision === "APPROVE" ? "success" : "info",
      });
      router.refresh();
    } catch {
      setError("Error al revisar la postulación.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <p role="alert" className="rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
      <input
        type="text"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Nota para el usuario (opcional)"
        maxLength={500}
        className="h-9 w-full rounded-input border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handle("APPROVE")}
          loading={pending === "approve"}
          className="flex-1"
        >
          <Check className="size-4" aria-hidden />
          Aprobar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handle("REJECT")}
          loading={pending === "reject"}
          className="flex-1"
        >
          <X className="size-4" aria-hidden />
          Rechazar
        </Button>
      </div>
    </div>
  );
}
