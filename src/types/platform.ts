export interface Platform {
  id: string;
  slug: string;
  name: string;
  shortName: string;
}

export interface PlatformRef {
  slug: string;
  shortName: string;
}

export type PlatformSlug = "pc" | "playstation" | "xbox" | "switch" | "mac" | "linux";
