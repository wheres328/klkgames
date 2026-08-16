import Image from "next/image";

export interface GameBackgroundProps {
  url: string;
  alt?: string;
}

// Fondo atmosférico para páginas de detalle de juego: el BANNER se muestra
// desenfocado y oscurecido detrás del contenido, desvaneciéndose hacia el fondo
// normal de Vortex (blur + opacidad + gradiente + máscara).
export function GameBackground({ url, alt }: GameBackgroundProps) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[72vh]">
      <Image
        src={url}
        alt={alt ?? ""}
        fill
        priority
        sizes="100vw"
        className="scale-110 object-cover opacity-30 blur-2xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
    </div>
  );
}
