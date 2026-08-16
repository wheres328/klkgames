export type GameStatus = "released" | "early-access" | "upcoming" | "abandoned" | "demo";

export type PricingModel = "free" | "paid" | "free-to-play" | "demo";

export type VideoType = "trailer" | "gameplay" | "review" | "developer" | "other";

export interface RequirementSet {
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
  vram: string;
  storage: string;
  directx: string;
}

export interface SystemRequirements {
  minimum: RequirementSet;
  recommended: RequirementSet;
}

export interface GameDownload {
  id: string;
  platform: string;
  name: string;
  url: string;
  version: string;
  size: string;
  isOfficial: boolean;
}

export interface GameVideo {
  id: string;
  type: VideoType;
  title: string;
  url: string;
  thumbnail: string;
}

export interface StarDistribution {
  stars: number;
  percentage: number;
}

// Mapeo conceptual al schema v3: GameImage con tipos COVER/BANNER/SCREENSHOT/GALLERY.
export type GameImageKind = "COVER" | "BANNER" | "SCREENSHOT" | "GALLERY";

export interface GameImageRef {
  type: GameImageKind;
  url: string;
  alt?: string;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  cover: string;
  banner: string;
  screenshots: string[];
  videos: GameVideo[];
  genres: string[];
  platforms: string[];
  /** Nombres de los géneros (resueltos por el service layer). */
  genreNames?: { slug: string; name: string }[];
  /** Nombres de las plataformas (resueltos por el service layer). */
  platformNames?: { slug: string; name: string }[];
  developer: string;
  publisher: string;
  releaseDate: string;
  releaseYear: number;
  rating: number;
  ratingCount: number;
  starDistribution: StarDistribution[];
  status: GameStatus;
  pricingModel: PricingModel;
  isSingleplayer: boolean;
  isMultiplayer: boolean;
  isIndie: boolean;
  requirements: SystemRequirements;
  downloads: GameDownload[];
  zipPassword: string | null;
  features: string[];
  recommendedTier: "excelente" | "bueno" | "jugable" | "limitado" | "no-recomendado";
}
