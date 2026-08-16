"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignRankAction } from "@/server/actions/adminRanks";
import { useToast } from "@/components/ui/Toast";

interface UserRankSelectProps {
  userId: string;
  rankId: string | null;
  ranks: Array<{ id: string; name: string; color: string | null }>;
  isSelf: boolean;
}

export function UserRankSelect({ userId, rankId, ranks, isSelf }: UserRankSelectProps) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value || null;
    if (next === rankId || pending) return;
    setPending(true);
    try {
      const result = await assignRankAction({ userId, rankId: next });
      if (!result.ok) {
        toast({ title: "Error", description: result.error, variant: "error" });
        return;
      }
      toast({ title: "Rango actualizado", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el rango.", variant: "error" });
    } finally {
      setPending(false);
    }
  };

  if (isSelf) return <span className="text-xs text-muted">—</span>;

  return (
    <select
      value={rankId ?? ""}
      onChange={handleChange}
      disabled={pending || ranks.length === 0}
      className="h-8 w-full max-w-40 rounded-input border border-border bg-surface px-2 text-xs text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
    >
      <option value="">Sin rango</option>
      {ranks.map((rank) => (
        <option key={rank.id} value={rank.id}>
          {rank.name}
        </option>
      ))}
    </select>
  );
}
