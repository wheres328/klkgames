import type { Game, GameImageRef } from "@/types/game";

// Resuelve las imágenes de un juego de forma compatible con el schema v3
// (GameImage canónica: COVER/BANNER/SCREENSHOT/GALLERY).

export interface GameImages {
  cover: GameImageRef;
  banner: GameImageRef;
  screenshots: GameImageRef[];
  gallery: GameImageRef[];
}

export function getGameImages(game: Game): GameImages {
  const cover: GameImageRef = { type: "COVER", url: game.cover, alt: `Portada de ${game.name}` };
  const banner: GameImageRef = { type: "BANNER", url: game.banner, alt: `Banner de ${game.name}` };
  const screenshots: GameImageRef[] = game.screenshots.map((url, index) => ({
    type: "SCREENSHOT",
    url,
    alt: `Captura ${index + 1} de ${game.name}`,
  }));
  const gallery: GameImageRef[] = screenshots.map((shot) => ({ ...shot, type: "GALLERY" }));

  return { cover, banner, screenshots, gallery };
}
