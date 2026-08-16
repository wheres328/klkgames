import { Monitor, Cpu, MemoryStick, HardDrive, Layers, Boxes } from "lucide-react";
import type { RequirementSet } from "@/types/game";
import { cn } from "@/lib/utils";

export interface RequirementCardProps {
  label: "Mínimos" | "Recomendados";
  requirements: RequirementSet;
  className?: string;
}

const rows: { key: keyof RequirementSet; label: string; icon: typeof Monitor }[] = [
  { key: "os", label: "Sistema operativo", icon: Monitor },
  { key: "cpu", label: "Procesador", icon: Cpu },
  { key: "gpu", label: "Gráficos", icon: Layers },
  { key: "vram", label: "VRAM", icon: Boxes },
  { key: "ram", label: "Memoria RAM", icon: MemoryStick },
  { key: "storage", label: "Almacenamiento", icon: HardDrive },
  { key: "directx", label: "DirectX", icon: Layers },
];

export function RequirementCard({ label, requirements, className }: RequirementCardProps) {
  return (
    <div className={cn("rounded-card border border-border bg-surface p-6", className)}>
      <h3 className="font-display text-base font-bold text-foreground">{label}</h3>
      <dl className="mt-4 space-y-3">
        {rows.map(({ key, label: rowLabel, icon: Icon }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
          >
            <dt className="flex items-center gap-2 text-sm text-muted">
              <Icon className="size-4 shrink-0 text-accent" aria-hidden />
              {rowLabel}
            </dt>
            <dd className="text-right text-sm font-medium text-foreground">{requirements[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
