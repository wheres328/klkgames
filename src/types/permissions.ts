export interface PermissionDef {
  code: string;
  label: string;
  group: "Contenido" | "Moderación" | "Administración";
}

export const PERMISSION_GROUPS = ["Contenido", "Moderación", "Administración"] as const;

export const PERMISSION_CATALOG: PermissionDef[] = [
  { code: "games.create", label: "Crear juegos", group: "Contenido" },
  { code: "games.edit", label: "Editar juegos", group: "Contenido" },
  { code: "games.publish", label: "Publicar juegos", group: "Contenido" },
  { code: "games.delete", label: "Eliminar juegos", group: "Contenido" },
  { code: "articles.create", label: "Crear artículos", group: "Contenido" },
  { code: "articles.edit", label: "Editar artículos", group: "Contenido" },
  { code: "articles.publish", label: "Publicar artículos", group: "Contenido" },
  { code: "media.upload", label: "Subir media", group: "Contenido" },
  { code: "comments.delete", label: "Moderar comentarios", group: "Moderación" },
  { code: "reports.resolve", label: "Resolver reportes", group: "Moderación" },
  { code: "badges.award", label: "Otorgar medallas", group: "Moderación" },
  { code: "reputation.award", label: "Ajustar reputación", group: "Moderación" },
  { code: "users.manage", label: "Gestionar usuarios", group: "Administración" },
  { code: "donations.manage", label: "Gestionar donaciones", group: "Administración" },
  { code: "ranks.manage", label: "Gestionar rangos", group: "Administración" },
  { code: "settings.manage", label: "Gestionar ajustes", group: "Administración" },
  { code: "audit.view", label: "Ver auditoría", group: "Administración" },
];

export const PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  PERMISSION_CATALOG.map((permission) => [permission.code, permission.label]),
);
