import { MonitorX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  /** URL del vídeo: enlace de YouTube o archivo directo (.mp4/.webm/...). */
  src?: string | null;
  title?: string;
  className?: string;
}

const FILE_EXTENSION = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;

// Extrae el ID de enlaces de YouTube: watch?v=..., youtu.be/..., embed/... y shorts/...
export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

function Unavailable({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-raised text-muted",
        className,
      )}
    >
      <MonitorX className="size-10" aria-hidden />
      <p className="text-sm font-medium">El vídeo no está disponible en este momento.</p>
    </div>
  );
}

// Reproductor de vídeo real: YouTube (embed sin cookies) y archivos directos.
// Si la URL no es reproducible se muestra un mensaje amable, sin placeholders.
export function VideoPlayer({ src, title, className }: VideoPlayerProps) {
  const url = (src ?? "").trim();

  if (!url || url === "#") {
    return <Unavailable className={className} />;
  }

  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
        title={title ?? "Vídeo"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className={cn("h-full w-full", className)}
      />
    );
  }

  if (FILE_EXTENSION.test(url)) {
    return (
      <video
        src={url}
        controls
        autoPlay
        playsInline
        title={title}
        className={cn("h-full w-full object-contain", className)}
      />
    );
  }

  return <Unavailable className={className} />;
}
