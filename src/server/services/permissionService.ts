import { db } from "@/lib/db";
import { PERMISSION_CATALOG } from "@/types/permissions";

export type { PermissionDef } from "@/types/permissions";
export { PERMISSION_CATALOG, PERMISSION_GROUPS, PERMISSION_LABELS } from "@/types/permissions";

// Permisos base que un MODERATOR tiene de serie sin necesidad de rango.
const MODERATOR_BASE = new Set([
  "comments.delete",
  "reports.resolve",
  "badges.award",
  "reputation.award",
]);

export interface PermissionActor {
  role: string;
  rank?: { permissions: string[] } | null;
}

// Un ADMIN tiene todos los permisos; un MODERATOR los base + los de su rango;
// el resto solo los de su rango.
export function hasPermission(user: PermissionActor | null | undefined, code: string): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "MODERATOR" && MODERATOR_BASE.has(code)) return true;
  return user.rank?.permissions.includes(code) ?? false;
}

// Permisos efectivos de un usuario de la BD (ADMIN = todos, MODERATOR = base + rango).
export async function getActorPermissions(userId: string | null | undefined): Promise<string[]> {
  if (!userId) return [];
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, rank: { select: { permissions: true } } },
  });
  if (!user) return [];
  if (user.role === "ADMIN") return PERMISSION_CATALOG.map((permission) => permission.code);
  const effective = new Set([...MODERATOR_BASE, ...(user.rank?.permissions ?? [])]);
  return Array.from(effective);
}
