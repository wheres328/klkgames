"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminActionResult } from "@/server/actions/admin";
import { adminSoftDeleteUser, adminUpdateUserRole } from "@/server/actions/admin";
import { cn } from "@/lib/utils";

interface UserActionsProps {
  userId: string;
  username: string;
  role: string;
  isSelf: boolean;
}

const selectClass =
  "h-8 rounded-input border border-border bg-surface px-2 text-xs font-medium text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50";

export function UserActions({ userId, username, role, isSelf }: UserActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setError(null);
    startTransition(async () => {
      const result: AdminActionResult = await adminUpdateUserRole(userId, event.target.value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar al usuario "${username}"? Se anonimizará su cuenta.`)) return;
    setError(null);
    startTransition(async () => {
      const result: AdminActionResult = await adminSoftDeleteUser(userId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <select
          aria-label={`Rol de ${username}`}
          className={cn(selectClass, pending && "opacity-50")}
          value={role}
          onChange={handleRoleChange}
          disabled={isSelf || pending}
        >
          <option value="USER">Usuario</option>
          <option value="MODERATOR">Moderador</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {!isSelf ? (
          <Button
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={handleDelete}
            aria-label={`Eliminar a ${username}`}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        ) : (
          <span className="text-xs text-muted">(tú)</span>
        )}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
