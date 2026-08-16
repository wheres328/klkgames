import type { Platform } from "@/types/platform";

export const platforms: Platform[] = [
  { id: "p1", slug: "pc", name: "PC", shortName: "PC" },
  { id: "p2", slug: "playstation", name: "PlayStation", shortName: "PS" },
  { id: "p3", slug: "xbox", name: "Xbox", shortName: "XBX" },
  { id: "p4", slug: "switch", name: "Nintendo Switch", shortName: "Switch" },
  { id: "p5", slug: "mac", name: "macOS", shortName: "Mac" },
  { id: "p6", slug: "linux", name: "Linux", shortName: "Lnx" },
];

export const platformBySlug = (slug: string) => platforms.find((p) => p.slug === slug);

export const platformShortName = (slug: string) =>
  platformBySlug(slug)?.shortName ?? slug.toUpperCase();
