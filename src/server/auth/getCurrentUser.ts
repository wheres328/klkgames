import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  image: string | null;
  role: string;
}

interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username?: string;
  role?: string;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const user = session.user as unknown as BetterAuthUser;
  return {
    id: user.id,
    username: user.username ?? "",
    name: user.name,
    image: user.image ?? null,
    role: user.role ?? "USER",
  };
}

// Helper síncrono para acciones de servidor: lanza si no hay sesión.
export async function requireUser(): Promise<{ user: SessionUser } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Debes iniciar sesión para realizar esta acción." };
  }
  return { user };
}
