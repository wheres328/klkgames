import type { Article } from "@/types/article";

export const articles: Article[] = [
  {
    id: "a1",
    slug: "mejores-juegos-survival-2026",
    title: "Los mejores juegos de survival para arrancar 2026",
    excerpt:
      "Supervivencia, crafteo y mundos hostiles: repasamos los títulos que dominarán el año en este género.",
    image: "https://picsum.photos/seed/article-survival/1200/630",
    category: "Guías",
    author: {
      id: "u2",
      username: "vox_magazine",
      name: "Redacción Vox",
      avatar: "https://picsum.photos/seed/vox/128/128",
    },
    publishedAt: "2026-02-10",
    readTime: "8 min",
    tags: ["survival", "sandbox", "top"],
    content: [
      "El género survival sigue siendo uno de los más vivos del catálogo. Entre la presión de recursos y la construcción de bases, hay espacio para experiencias muy distintas.",
      "Core Keeper lidera la conversación gracias a su cooperativo y su minado adictivo. Por su parte, Subnautica sigue demostrando que la exploración puede ser tan tensa como gratificante.",
      "Si buscas algo más relajado, los sandbox de gestión ofrecen cientos de horas sin prisa. El punto clave: encontrar el título que encaje con tu ritmo de juego.",
    ],
    relatedGames: ["core-keeper", "subnautica", "terraria"],
  },
  {
    id: "a2",
    slug: "que-es-roguelike-origenes-y-mejores-titulos",
    title: "¿Qué es un roguelike? Orígenes y títulos imprescindibles",
    excerpt:
      "Del Nethack a Balatro: cómo un género para puristas conquistó a millones de jugadores.",
    image: "https://picsum.photos/seed/article-roguelike/1200/630",
    category: "Especiales",
    author: {
      id: "u3",
      username: "lunar_prism",
      name: "Lunar",
      avatar: "https://picsum.photos/seed/lunar/128/128",
    },
    publishedAt: "2026-01-28",
    readTime: "6 min",
    tags: ["roguelike", "cultura", "historia"],
    content: [
      "El roguelike moderno debe mucho al dungeon crawler de los 80, pero hoy significa algo distinto: muerte permanente, progreso parcial y combates que nunca se repiten.",
      "Títulos como Hades demostraron que la muerte puede contar una historia, mientras que Balatro llevó la fórmula a un terreno inesperado con el póker.",
      "El género sigue expandiéndose, mezclándose con la estrategia, la acción e incluso la simulación.",
    ],
    relatedGames: ["hades", "balatro", "noita"],
  },
  {
    id: "a3",
    slug: "juegos-gratis-que-deberias-probar",
    title: "Juegos gratis que deberías probar este mes",
    excerpt:
      "No hace falta pagar para pasarlo bien: una selección de títulos free-to-play imprescindibles.",
    image: "https://picsum.photos/seed/article-free/1200/630",
    category: "Listas",
    author: {
      id: "u4",
      username: "darkpixel",
      name: "Dark Pixel",
      avatar: "https://picsum.photos/seed/darkpixel/128/128",
    },
    publishedAt: "2026-01-15",
    readTime: "5 min",
    tags: ["free-to-play", "lista", "multijugador"],
    content: [
      "El free-to-play tiene muy mala fama, pero también esconde joyas que compiten con los grandes lanzamientos de pago.",
      "War Thunder ofrece un arsenal histórico enorme sin coste de entrada, y su modelo de progresión premia la constancia.",
      "Nuestra recomendación: entra sin prejuicios, invierte solo si de verdad engancha y, sobre todo, diviértete.",
    ],
    relatedGames: ["war-thunder"],
  },
  {
    id: "a4",
    slug: "requisitos-pc-juegos-2026",
    title: "Requisitos de PC para los grandes juegos de 2026",
    excerpt:
      "¿Necesitas actualizar tu equipo? Comparamos las especificaciones exigidas por los lanzamientos más esperados.",
    image: "https://picsum.photos/seed/article-requisitos/1200/630",
    category: "Hardware",
    author: {
      id: "u1",
      username: "nebulux",
      name: "Nebulux",
      avatar: "https://picsum.photos/seed/nebulux/128/128",
    },
    publishedAt: "2025-12-20",
    readTime: "10 min",
    tags: ["hardware", "pc", "requisitos"],
    content: [
      "La brecha entre requisitos mínimos y recomendados es cada vez mayor. Conocer tu hardware es el primer paso para comprar con criterio.",
      "Para jugar cómodo en 1080p, una GPU de 6 GB de VRAM y 16 GB de RAM siguen siendo el punto dulce.",
      "En nuestra sección de cada juego podrás consultar los requisitos detallados y compararlos con tu equipo.",
    ],
    relatedGames: ["satisfactory", "palworld", "factorio"],
  },
  {
    id: "a5",
    slug: "horror-cooperativo-para-jugar-con-amigos",
    title: "El mejor horror cooperativo para jugar con amigos",
    excerpt:
      "El miedo es mejor en compañía: investigaciones paranormales y sustos garantizados para tu grupo.",
    image: "https://picsum.photos/seed/article-horror/1200/630",
    category: "Recomendaciones",
    author: {
      id: "u4",
      username: "darkpixel",
      name: "Dark Pixel",
      avatar: "https://picsum.photos/seed/darkpixel/128/128",
    },
    publishedAt: "2025-11-30",
    readTime: "7 min",
    tags: ["horror", "cooperativo", "multijugador"],
    content: [
      "Nada une a un equipo como una experiencia de miedo compartida. Phasmophobia convierte cada sesión en una partida única.",
      "El diálogo por proximidad y las evidencias aleatorias mantienen la tensión incluso tras decenas de horas.",
      "Recomendamos jugar con luces apagadas, auriculares y, a ser posible, un amigo que grite menos que tú.",
    ],
    relatedGames: ["phasmophobia"],
  },
];

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);

export const articlesForGames = (gameSlugs: string[]) =>
  articles.filter((a) => a.relatedGames.some((slug) => gameSlugs.includes(slug)));
