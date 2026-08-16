"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, EyeOff, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminActionResult } from "@/server/actions/admin";
import {
  adminArchiveGame,
  adminDeleteGame,
  adminPublishGame,
  adminUnpublishGame,
} from "@/server/actions/admin";

interface GameActionsProps {
  id: string;
  publishStatus: string;
}

export function GameActions({ id, publishStatus }: GameActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: (id: unknown) => Promise<AdminActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!window.confirm("¿Eliminar este juego? Esta acción no se puede deshacer.")) return;
    run(adminDeleteGame);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {publishStatus !== "PUBLISHED" ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => run(adminPublishGame)}
          >
            <Upload className="size-3.5" aria-hidden />
            Publicar
          </Button>
        ) : null}
        {publishStatus === "PUBLISHED" ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => run(adminUnpublishGame)}
          >
            <EyeOff className="size-3.5" aria-hidden />
            Despublicar
          </Button>
        ) : null}
        {publishStatus !== "ARCHIVED" ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => run(adminArchiveGame)}
          >
            <Archive className="size-3.5" aria-hidden />
            Archivar
          </Button>
        ) : null}
        <Button variant="danger" size="sm" disabled={pending} onClick={handleDelete}>
          <Trash2 className="size-3.5" aria-hidden />
          Eliminar
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
