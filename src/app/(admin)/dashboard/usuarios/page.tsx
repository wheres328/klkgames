import { listUsersAdmin } from "@/server/services/adminService";
import { listRanks } from "@/server/services/rankService";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UserActions } from "@/components/admin/UserActions";
import { UserRankSelect } from "@/components/admin/UserRankSelect";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { USER_ROLE_LABELS, roleTone } from "@/components/admin/constants";

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const [currentUser, result, ranks] = await Promise.all([
    getCurrentUser(),
    listUsersAdmin({ q, pageSize: 200 }),
    listRanks(),
  ]);

  return (
    <div>
      <AdminPageHeader title="Usuarios" description={`${result.total} usuario(s) registrados.`} />

      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface p-3"
      >
        <div className="min-w-52 flex-1">
          <label htmlFor="user-search" className="mb-1.5 block text-xs font-medium text-muted">
            Buscar por nombre, usuario o email
          </label>
          <input
            id="user-search"
            name="q"
            defaultValue={q}
            placeholder="Ej. admin"
            className="h-9 w-full rounded-input border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-input border border-border bg-surface px-3 text-sm font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground"
        >
          Buscar
        </button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="No hay usuarios"
          description="Ningún usuario coincide con la búsqueda."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted">
                <th className="px-4 py-2.5 font-semibold">Usuario</th>
                <th className="px-4 py-2.5 font-semibold">Email</th>
                <th className="px-4 py-2.5 font-semibold">Rol</th>
                <th className="px-4 py-2.5 font-semibold">Puntos</th>
                <th className="px-4 py-2.5 font-semibold">Rango</th>
                <th className="px-4 py-2.5 font-semibold">Registro</th>
                <th className="px-4 py-2.5 font-semibold">Gestión</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((user) => (
                <tr key={user.id} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted">@{user.username}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleTone(user.role)}>
                      {USER_ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-accent-2">{user.reputation}</span>
                  </td>
                  <td className="px-4 py-3">
                    <UserRankSelect
                      userId={user.id}
                      rankId={user.rank?.id ?? null}
                      ranks={ranks.map((rank) => ({
                        id: rank.id,
                        name: rank.name,
                        color: rank.color,
                      }))}
                      isSelf={currentUser?.id === user.id}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {user.createdAt.toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3">
                    <UserActions
                      userId={user.id}
                      username={user.username}
                      role={user.role}
                      isSelf={currentUser?.id === user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
