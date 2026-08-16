"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminActionResult } from "@/server/actions/admin";
import { adminDeleteBadge } from "@/server/actions/admin";

interface BadgeDeleteButtonProps {
  id: string;
  name: string;
}

export function BadgeDeleteButton({ id, name }: BadgeDeleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar la medalla "${name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result: AdminActionResult = await adminDeleteBadge(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="danger" size="sm" disabled={pending} onClick={handleDelete}>
        <Trash2 className="size-3.5" aria-hidden />
        Eliminar
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
