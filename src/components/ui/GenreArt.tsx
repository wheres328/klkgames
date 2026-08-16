import {
  generateGenreShapes,
  GENRE_ART_VIEWBOX,
  GENRE_PATTERN_STYLES,
  type GenrePatternShape,
  type GenrePatternStyle,
} from "@/lib/genre-art";
import { cn } from "@/lib/utils";

export interface GenreArtProps {
  style?: GenrePatternStyle | null;
  seed?: number | null;
  accentFrom: string;
  accentTo: string;
  className?: string;
}

function Shape({ shape }: { shape: GenrePatternShape }) {
  switch (shape.kind) {
    case "polygon":
      return (
        <polygon
          points={shape.points}
          fill={shape.fill}
          fillOpacity={shape.opacity}
          transform={shape.transform}
        />
      );
    case "dot":
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} fillOpacity={shape.opacity} />;
    case "ring":
      return (
        <circle
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill="none"
          stroke={shape.stroke}
          strokeOpacity={shape.opacity}
          strokeWidth={shape.width}
        />
      );
    case "rect":
      return (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          fillOpacity={shape.opacity}
        />
      );
    case "line":
      return (
        <line
          x1={shape.x1}
          y1={shape.y1}
          x2={shape.x2}
          y2={shape.y2}
          stroke={shape.stroke}
          strokeOpacity={shape.opacity}
          strokeWidth={shape.width}
        />
      );
    case "path":
      return (
        <path
          d={shape.d}
          fill="none"
          stroke={shape.stroke}
          strokeOpacity={shape.opacity}
          strokeWidth={shape.width}
        />
      );
  }
}

// Portada vectorial generada para un género sin imagen: fondo oscuro con el
// patrón elegido en los colores del género (viewBox 4:5, slice para que cubra).
export function GenreArt({ style, seed, accentFrom, accentTo, className }: GenreArtProps) {
  const effectiveStyle: GenrePatternStyle =
    style && GENRE_PATTERN_STYLES.includes(style) ? style : "triangles";
  const shapes = generateGenreShapes(effectiveStyle, seed ?? 1, accentFrom, accentTo);

  return (
    <svg
      viewBox={`0 0 ${GENRE_ART_VIEWBOX.width} ${GENRE_ART_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={cn("block", className)}
    >
      <rect
        width={GENRE_ART_VIEWBOX.width}
        height={GENRE_ART_VIEWBOX.height}
        fill="#0a0a0a"
      />
      {shapes.map((shape, index) => (
        <Shape key={index} shape={shape} />
      ))}
    </svg>
  );
}
