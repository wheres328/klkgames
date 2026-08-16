export const GAME_STATUS_LABELS: Record<string, string> = {
  RELEASED: "Lanzado",
  EARLY_ACCESS: "Acceso anticipado",
  UPCOMING: "Próximamente",
  ABANDONED: "Abandonado",
  DEMO: "Demo",
};

export const PUBLISH_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

export const RECOMMENDATION_TIER_LABELS: Record<string, string> = {
  EXCELENTE: "Excelente",
  BUENO: "Bueno",
  ACEPTABLE: "Aceptable",
  NO_RECOMENDADO: "No recomendado",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  USER: "Usuario",
  MODERATOR: "Moderador",
  ADMIN: "Administrador",
};

export const DONATION_PLATFORM_LABELS: Record<string, string> = {
  PATREON: "Patreon",
  PAYPAL: "PayPal",
  CRYPTO: "Criptomonedas",
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  CREATE_GAME: "Crear juego",
  UPDATE_GAME: "Editar juego",
  PUBLISH_GAME: "Publicar juego",
  ARCHIVE_GAME: "Archivar juego",
  DELETE_GAME: "Eliminar juego",
  CREATE_ARTICLE: "Crear artículo",
  UPDATE_ARTICLE: "Editar artículo",
  PUBLISH_ARTICLE: "Publicar artículo",
  ARCHIVE_ARTICLE: "Archivar artículo",
  DELETE_ARTICLE: "Eliminar artículo",
  CREATE_GENRE: "Crear género",
  UPDATE_GENRE: "Editar género",
  DELETE_GENRE: "Eliminar género",
  CREATE_PLATFORM: "Crear plataforma",
  UPDATE_PLATFORM: "Editar plataforma",
  DELETE_PLATFORM: "Eliminar plataforma",
  CREATE_TAG: "Crear etiqueta",
  UPDATE_TAG: "Editar etiqueta",
  DELETE_TAG: "Eliminar etiqueta",
  UPDATE_USER: "Editar usuario",
  DELETE_USER: "Eliminar usuario",
  BAN_USER: "Banear usuario",
  UNBAN_USER: "Desbanear usuario",
  DELETE_COMMENT: "Eliminar comentario",
  HIDE_COMMENT: "Ocultar comentario",
  RESOLVE_REPORT: "Resolver reporte",
  DISMISS_REPORT: "Descartar reporte",
  UPLOAD_MEDIA: "Subir media",
  REPLACE_MEDIA: "Reemplazar media",
  DELETE_MEDIA: "Eliminar media",
  UPDATE_SETTING: "Actualizar ajuste",
  AWARD_REPUTATION: "Ajustar reputación",
  GRANT_ROLE: "Cambiar rol",
  CREATE_DONATION: "Crear donación",
  UPDATE_DONATION: "Editar donación",
  DELETE_DONATION: "Eliminar donación",
  CREATE_RANK: "Crear rango",
  UPDATE_RANK: "Editar rango",
  DELETE_RANK: "Eliminar rango",
};

export type BadgeTone = "accent" | "success" | "warning" | "danger" | "neutral" | "gradient";

export function publishStatusTone(status: string): "success" | "warning" | "neutral" {
  if (status === "PUBLISHED") return "success";
  if (status === "DRAFT") return "warning";
  return "neutral";
}

export function roleTone(role: string): "accent" | "warning" | "neutral" {
  if (role === "ADMIN") return "accent";
  if (role === "MODERATOR") return "warning";
  return "neutral";
}
