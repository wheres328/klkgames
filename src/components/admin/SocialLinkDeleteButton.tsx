"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminActionResult } from "@/server/actions/adminSettings";
import { adminDeleteSocialLink } from "@/server/actions/adminSettings";

interface SocialLinkDeleteButtonProps {
  id: string;
  name: string;
}

export function SocialLinkDeleteButton({ id, name }: SocialLinkDeleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar el enlace "${name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result: AdminActionResult = await adminDeleteSocialLink(id);
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
