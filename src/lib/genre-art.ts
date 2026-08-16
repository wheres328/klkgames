// Patrones vectoriales generados para la portada de un género cuando no hay
// imagen. Cada estilo produce formas deterministas a partir de una semilla, así
// el diseño "Aleatorio" es reproducible en servidor y cliente.

export const GENRE_PATTERN_STYLES = [
  "triangles",
  "circles",
  "waves",
  "grid",
  "lines",
  "stars",
] as const;

export type GenrePatternStyle = (typeof GENRE_PATTERN_STYLES)[number];

export const GENRE_PATTERN_LABELS: Record<GenrePatternStyle, string> = {
  triangles: "Triángulos",
  circles: "Círculos",
  waves: "Olas",
  grid: "Cuadrícula",
  lines: "Líneas",
  stars: "Estrellas",
};

// Máximo permitido por la columna Int de PostgreSQL (32 bits con signo).
export const MAX_PATTERN_SEED = 2147483646;

// Semilla estable a partir de un nombre (para géneros sin patternSeed).
export function genreSeedFromName(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % (MAX_PATTERN_SEED + 1);
}

// PRNG determinista (mulberry32): misma semilla => misma secuencia.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type GenrePatternShape =
  | { kind: "polygon"; points: string; fill: string; opacity: number; transform?: string }
  | { kind: "dot"; cx: number; cy: number; r: number; fill: string; opacity: number }
  | { kind: "ring"; cx: number; cy: number; r: number; stroke: string; opacity: number; width: number }
  | { kind: "rect"; x: number; y: number; width: number; height: number; fill: string; opacity: number }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; opacity: number; width: number }
  | { kind: "path"; d: string; stroke: string; opacity: number; width: number };

export const GENRE_ART_VIEWBOX = { width: 200, height: 250 };

// Redondeo a 3 decimales: garantiza que el SVG generado en servidor (Node) y en
// el navegador coincida byte a byte (Math.cos/Math.sin pueden diferir en el
// último decimal entre motores JS) y evita hydration mismatches.
const r3 = (n: number) => Math.round(n * 1000) / 1000;

// Genera las formas de un estilo con la semilla y los colores del género.
export function generateGenreShapes(
  style: GenrePatternStyle,
  seed: number,
  accentFrom: string,
  accentTo: string,
): GenrePatternShape[] {
  const rnd = mulberry32(seed);
  const shapes: GenrePatternShape[] = [];
  const pickColor = (r: number) => (r < 0.5 ? accentFrom : accentTo);
  const withAlpha = (color: string) => ({ fill: color, opacity: r3(0.15 + rnd() * 0.6) });

  if (style === "triangles") {
    for (let i = 0; i < 14; i++) {
      const cx = r3(rnd() * 200);
      const cy = r3(rnd() * 250);
      const size = r3(20 + rnd() * 75);
      const rot = Math.floor(rnd() * 120);
      const { fill, opacity } = withAlpha(pickColor(rnd()));
      shapes.push({
        kind: "polygon",
        points: `${cx},${r3(cy - size)} ${r3(cx - size * 0.87)},${r3(cy + size * 0.5)} ${r3(cx + size * 0.87)},${r3(cy + size * 0.5)}`,
        fill,
        opacity,
        transform: `rotate(${rot} ${cx} ${cy})`,
      });
    }
    return shapes;
  }

  if (style === "circles") {
    for (let i = 0; i < 7; i++) {
      const cx = r3(rnd() * 200);
      const cy = r3(rnd() * 250);
      const r = r3(18 + rnd() * 55);
      const color = pickColor(rnd());
      shapes.push({
        kind: "ring",
        cx,
        cy,
        r,
        stroke: color,
        opacity: r3(0.25 + rnd() * 0.55),
        width: r3(1.5 + rnd() * 5),
      });
    }
    for (let i = 0; i < 12; i++) {
      const cx = r3(rnd() * 200);
      const cy = r3(rnd() * 250);
      const { fill, opacity } = withAlpha(pickColor(rnd()));
      shapes.push({ kind: "dot", cx, cy, r: r3(2 + rnd() * 10), fill, opacity });
    }
    return shapes;
  }

  if (style === "waves") {
    for (let i = 0; i < 8; i++) {
      const y = r3(20 + rnd() * 210);
      const amp = r3(8 + rnd() * 24);
      const phase = r3(rnd() * 60);
      const color = pickColor(rnd());
      shapes.push({
        kind: "path",
        d: `M 0 ${y} Q ${r3(50 + phase)} ${r3(y - amp)} 100 ${y} T 200 ${y}`,
        stroke: color,
        opacity: r3(0.3 + rnd() * 0.55),
        width: r3(1.5 + rnd() * 4),
      });
    }
    return shapes;
  }

  if (style === "grid") {
    const cell = r3(25 + rnd() * 15);
    const rows = Math.ceil(250 / cell);
    const cols = Math.ceil(200 / cell);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (rnd() < 0.34) {
          const { fill, opacity } = withAlpha(pickColor(rnd()));
          shapes.push({
            kind: "rect",
            x: r3(col * cell),
            y: r3(row * cell),
            width: cell,
            height: cell,
            fill,
            opacity,
          });
        }
      }
    }
    return shapes;
  }

  if (style === "lines") {
    for (let i = 0; i < 14; i++) {
      const x1 = r3(rnd() * 200);
      const y1 = r3(rnd() * 250);
      const len = r3(30 + rnd() * 130);
      const direction = rnd() < 0.5 ? 1 : -1;
      const color = pickColor(rnd());
      shapes.push({
        kind: "line",
        x1,
        y1,
        x2: r3(x1 + len * direction),
        y2: r3(y1 + len * 0.6),
        stroke: color,
        opacity: r3(0.25 + rnd() * 0.55),
        width: r3(1.5 + rnd() * 6),
      });
    }
    return shapes;
  }

  // stars
  for (let i = 0; i < 9; i++) {
    const cx = r3(rnd() * 200);
    const cy = r3(rnd() * 250);
    const spikes = 5;
    const outer = r3(12 + rnd() * 45);
    const inner = r3(outer * 0.4);
    const rot = Math.floor(rnd() * 360);
    const points: string[] = [];
    for (let s = 0; s < spikes * 2; s++) {
      const radius = s % 2 === 0 ? outer : inner;
      const angle = (Math.PI * s) / spikes + (rot * Math.PI) / 180;
      points.push(`${r3(cx + Math.cos(angle) * radius)},${r3(cy + Math.sin(angle) * radius)}`);
    }
    const { fill, opacity } = withAlpha(pickColor(rnd()));
    shapes.push({ kind: "polygon", points: points.join(" "), fill, opacity });
  }
  return shapes;
}

// Resuelve el patrón efectivo de un género: usa el elegido o el estilo por
// defecto con una semilla estable derivada del nombre.
export function resolveGenrePattern(genre: {
  name: string;
  patternStyle?: GenrePatternStyle | null;
  patternSeed?: number | null;
}): { style: GenrePatternStyle; seed: number } {
  const style = GENRE_PATTERN_STYLES.includes(genre.patternStyle as GenrePatternStyle)
    ? (genre.patternStyle as GenrePatternStyle)
    : "triangles";
  return {
    style,
    seed: genre.patternSeed ?? genreSeedFromName(genre.name || "genero"),
  };
}
