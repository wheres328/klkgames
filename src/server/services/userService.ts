import { db } from "@/lib/db";
import { toUserView, type UserRow } from "@/server/services/mappers";
import { updateUserSchema } from "@/server/validation/userValidation";
import { createAuditLog, serializeForAudit } from "@/server/services/auditService";
import type { z } from "zod";
import type { User } from "@/types/user";

type UpdateUserInput = z.infer<typeof updateUserSchema>;

export interface UserListOptions {
  q?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export interface UserListResult {
  items: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await db.user.findUnique({ where: { id } });
  return row ? toUserView(row as unknown as UserRow) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await db.user.findUnique({ where: { email } });
  return row ? toUserView(row as unknown as UserRow) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const row = await db.user.findUnique({ where: { username } });
  return row ? toUserView(row as unknown as UserRow) : null;
}

export async function listUsers(options: UserListOptions = {}): Promise<UserListResult> {
  const { q, role, page = 1, pageSize = 20 } = options;
  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { username: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role ? { role: role as "USER" | "MODERATOR" | "ADMIN" } : {}),
  };
  const currentPage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);

  const [total, rows] = await db.$transaction([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (currentPage - 1) * safePageSize,
      take: safePageSize,
    }),
  ]);

  return {
    items: (rows as unknown as UserRow[]).map(toUserView),
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    currentPage,
  };
}

// Solo campos editables; nunca la contraseña ni el email desde el cliente salvo
// que vengan validados (email queda fuera del borrador de campos editables aquí).
export async function updateUser(
  id: string,
  input: UpdateUserInput,
  options?: { actorId?: string },
): Promise<User> {
  const before = await db.user.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, role: true },
  });
  const row = await db.user.update({ where: { id }, data: input });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "UPDATE_USER",
    entityType: "User",
    entityId: id,
    before: before ?? undefined,
    after: serializeUserForAudit(input),
  });
  return toUserView(row as unknown as UserRow);
}

// Soft-delete por anonymización: no borra la fila (Comment.authorId usa Restrict
// y la auditoría debe sobrevivir). Restauración requiere guardar los valores
// originales (pendiente de campo de estado en el schema, FASE 4).
export async function softDeleteUser(id: string, options?: { actorId?: string }): Promise<void> {
  const before = await db.user.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, email: true, role: true },
  });
  if (!before) throw new Error("Usuario no encontrado");

  await db.user.update({
    where: { id },
    data: {
      username: `eliminado-${id}`,
      email: `eliminado-${id}@vortex.local`,
      name: "Usuario eliminado",
      image: null,
      bio: null,
      passwordHash: null,
      role: "USER",
    },
  });

  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "DELETE_USER",
    entityType: "User",
    entityId: id,
    before: serializeForAudit(before),
  });
}

export interface CommunityMember {
  user: User;
  stats: { games: number; comments: number; followers: number };
}

export async function getCommunityMembers(limit = 4): Promise<CommunityMember[]> {
  const rows = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      bio: true,
      role: true,
      _count: { select: { favorites: true, comments: true } },
    },
  });

  return rows.map((row) => ({
    user: toUserView(row as unknown as UserRow),
    stats: {
      games: row._count.favorites,
      comments: row._count.comments,
      followers: 0,
    },
  }));
}

function serializeUserForAudit(input: unknown) {
  const value = input as Partial<UpdateUserInput> | undefined;
  if (!value) return undefined;
  return {
    ...(value.username ? { username: value.username } : {}),
    ...(value.name ? { name: value.name } : {}),
    ...(value.role ? { role: value.role } : {}),
    ...(value.bio !== undefined ? { bio: value.bio } : {}),
    ...(value.image !== undefined ? { image: value.image ?? null } : {}),
    ...(value.cover !== undefined ? { cover: value.cover ?? null } : {}),
  };
}
