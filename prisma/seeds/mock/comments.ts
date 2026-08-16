import type { Comment } from "@/types/comment";

export const comments: Comment[] = [
  {
    id: "c1",
    user: {
      id: "u5",
      username: "casual_sam",
      name: "Sam",
      avatar: "https://picsum.photos/seed/casual/128/128",
    },
    date: "2026-07-12",
    content:
      "Llevo más de 40 horas y todavía hay zonas que no he explorado. El cooperativo con amigos es de lo mejor que he probado este año.",
    likes: 24,
    replies: [
      {
        id: "c1r1",
        user: {
          id: "u6",
          username: "build_bot",
          name: "BuildBot",
          avatar: "https://picsum.photos/seed/buildbot/128/128",
        },
        date: "2026-07-12",
        content: "Totalmente de acuerdo. Los jefes del bioma de magma son una pasada.",
        likes: 8,
        replies: [],
      },
      {
        id: "c1r2",
        user: {
          id: "u3",
          username: "lunar_prism",
          name: "Lunar",
          avatar: "https://picsum.photos/seed/lunar/128/128",
        },
        date: "2026-07-13",
        content: "¿Recomendáis entrar con amigos o mejor solo al principio?",
        likes: 3,
        replies: [],
      },
    ],
  },
  {
    id: "c2",
    user: {
      id: "u4",
      username: "darkpixel",
      name: "Dark Pixel",
      avatar: "https://picsum.photos/seed/darkpixel/128/128",
    },
    date: "2026-07-10",
    content:
      "La ambientación sonora es brutal. Con auriculares se te mete el miedo de verdad en la primera hora.",
    likes: 17,
    replies: [],
  },
  {
    id: "c3",
    user: {
      id: "u7",
      username: "ghost_techo",
      name: "Ghost",
      avatar: "https://picsum.photos/seed/ghost/128/128",
    },
    date: "2026-07-08",
    content:
      "La optimización mejoró muchísimo después de las últimas actualizaciones. Cero quejas.",
    likes: 11,
    replies: [],
  },
];

export const communityActivity = [
  {
    id: "act1",
    user: {
      id: "u5",
      username: "casual_sam",
      name: "Sam",
      avatar: "https://picsum.photos/seed/casual/128/128",
    },
    action: "valoró con 5 estrellas",
    target: "Hades",
    date: "hace 2 h",
  },
  {
    id: "act2",
    user: {
      id: "u6",
      username: "build_bot",
      name: "BuildBot",
      avatar: "https://picsum.photos/seed/buildbot/128/128",
    },
    action: "añadió a favoritos",
    target: "Factorio",
    date: "hace 5 h",
  },
  {
    id: "act3",
    user: {
      id: "u3",
      username: "lunar_prism",
      name: "Lunar",
      avatar: "https://picsum.photos/seed/lunar/128/128",
    },
    action: "comentó en",
    target: "Balatro",
    date: "hace 1 d",
  },
  {
    id: "act4",
    user: {
      id: "u4",
      username: "darkpixel",
      name: "Dark Pixel",
      avatar: "https://picsum.photos/seed/darkpixel/128/128",
    },
    action: "valoró con 4 estrellas",
    target: "Phasmophobia",
    date: "hace 1 d",
  },
];
