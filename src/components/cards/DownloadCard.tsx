import { Download, ShieldCheck, ExternalLink, HardDrive, Code2 } from "lucide-react";
import type { GameDownload } from "@/types/game";
import { cn } from "@/lib/utils";

export interface DownloadCardProps {
  download: GameDownload;
  className?: string;
}

export function DownloadCard({ download, className }: DownloadCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-card border border-border bg-surface p-5 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-accent/10 text-accent">
          <Download className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {download.name}
            <span className="ml-2 text-xs font-normal text-muted">{download.platform}</span>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Code2 className="size-3.5" aria-hidden /> v{download.version}
            </span>
            <span className="inline-flex items-center gap-1">
              <HardDrive className="size-3.5" aria-hidden /> {download.size}
            </span>
            {download.isOfficial && (
              <span className="inline-flex items-center gap-1 text-emerald-500">
                <ShieldCheck className="size-3.5" aria-hidden /> Oficial
              </span>
            )}
          </div>
        </div>
      </div>

      <a
        href={download.url}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-card border border-accent/40 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
      >
        Descargar
        <ExternalLink className="size-4" aria-hidden />
      </a>
    </div>
  );
}
