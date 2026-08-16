import type { User, UserSummary } from "@/types/user";

export const users: User[] = [
  {
    id: "u1",
    username: "nebulux",
    name: "Nebulux",
    avatar: "https://picsum.photos/seed/nebulux/128/128",
    role: "admin",
    bio: "Jugador de todo un poco. Amante de los survival y los sandbox.",
  },
  {
    id: "u2",
    username: "vox_magazine",
    name: "Redacción Vox",
    avatar: "https://picsum.photos/seed/vox/128/128",
    role: "admin",
    bio: "El equipo editorial de la plataforma.",
  },
  {
    id: "u3",
    username: "lunar_prism",
    name: "Lunar",
    avatar: "https://picsum.photos/seed/lunar/128/128",
    role: "moderator",
    bio: "Moderadora y jugona de roguelikes.",
  },
  {
    id: "u4",
    username: "darkpixel",
    name: "Dark Pixel",
    avatar: "https://picsum.photos/seed/darkpixel/128/128",
    role: "user",
    bio: "Horror, acción y café.",
  },
  {
    id: "u5",
    username: "casual_sam",
    name: "Sam",
    avatar: "https://picsum.photos/seed/casual/128/128",
    role: "user",
    bio: "Juego para desconectar.",
  },
  {
    id: "u6",
    username: "build_bot",
    name: "BuildBot",
    avatar: "https://picsum.photos/seed/buildbot/128/128",
    role: "user",
    bio: "Factorio addict.",
  },
  {
    id: "u7",
    username: "ghost_techo",
    name: "Ghost",
    avatar: "https://picsum.photos/seed/ghost/128/128",
    role: "user",
  },
];

export const userByUsername = (username: string) => users.find((u) => u.username === username);

export const toUserSummary = (user: User): UserSummary => ({
  id: user.id,
  username: user.username,
  name: user.name,
  avatar: user.avatar,
});
