import { Monitor, Cpu, Layers, Boxes, MemoryStick, HardDrive, Gamepad2 } from "lucide-react";
import type { RequirementSet } from "@/types/game";
import { cn } from "@/lib/utils";

export interface RequirementsTableProps {
  minimum: RequirementSet;
  recommended: RequirementSet;
  className?: string;
}

const rows: { key: keyof RequirementSet; label: string; icon: typeof Monitor }[] = [
  { key: "os", label: "Sistema operativo", icon: Monitor },
  { key: "cpu", label: "Procesador", icon: Cpu },
  { key: "gpu", label: "Gráficos", icon: Layers },
  { key: "vram", label: "VRAM", icon: Boxes },
  { key: "ram", label: "Memoria RAM", icon: MemoryStick },
  { key: "storage", label: "Almacenamiento", icon: HardDrive },
  { key: "directx", label: "DirectX", icon: Gamepad2 },
];

// Requisitos como tabla/base de datos: columnas Mínimo | Recomendado.
export function RequirementsTable({ minimum, recommended, className }: RequirementsTableProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-card border border-border bg-surface/40", className)}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <caption className="sr-only">Requisitos del sistema</caption>
          <thead>
            <tr className="border-b border-border/60 bg-surface/60">
              <th
                scope="col"
                className="px-4 py-2.5 text-[10px] font-semibold tracking-wider text-muted uppercase"
              >
                Componente
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-[10px] font-semibold tracking-wider text-muted uppercase"
              >
                Mínimo
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-[10px] font-semibold tracking-wider text-accent-2 uppercase"
              >
                Recomendado
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, label, icon: Icon }, index) => (
              <tr
                key={key}
                className={cn(
                  "border-b border-border/40 transition-colors last:border-0 hover:bg-surface-raised/50",
                  index % 2 === 1 && "bg-surface/30",
                )}
              >
                <th scope="row" className="px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-foreground">
                    <Icon className="size-4 shrink-0 text-accent" aria-hidden />
                    {label}
                  </span>
                </th>
                <td className="px-4 py-3 text-sm text-muted">{minimum[key]}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {recommended[key]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
