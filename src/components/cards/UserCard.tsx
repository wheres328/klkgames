import Link from "next/link";
import { Shield, ShieldCheck, UserRound } from "lucide-react";
import type { User } from "@/types/user";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export interface UserCardProps {
  user: User;
  stats: { games: number; comments: number; followers: number };
  className?: string;
}

const roleConfig = {
  admin: { label: "Admin", icon: ShieldCheck, className: "bg-amber-500/10 text-amber-500" },
  moderator: { label: "Moderador", icon: Shield, className: "bg-sky-500/10 text-sky-500" },
  user: { label: "Jugador", icon: UserRound, className: "bg-muted/10 text-muted" },
} as const;

export function UserCard({ user, stats, className }: UserCardProps) {
  const role = roleConfig[user.role];
  const RoleIcon = role.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center",
        className,
      )}
    >
      <Link
        href={`/usuarios/${user.username}`}
        className="group flex flex-col items-center gap-3 text-center"
      >
        <Avatar src={user.avatar} name={user.name} size="lg" />
        <div>
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-display text-base font-semibold text-foreground transition-colors group-hover:text-accent">
              {user.name}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-input px-1.5 py-0.5 text-[10px] font-bold",
                role.className,
              )}
            >
              <RoleIcon className="size-3" aria-hidden />
              {role.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">@{user.username}</p>
        </div>
      </Link>

      {user.bio && <p className="line-clamp-2 text-sm text-muted">{user.bio}</p>}

      <dl className="grid w-full grid-cols-3 gap-2 border-t border-border pt-4">
        {(
          [
            ["Juegos", stats.games],
            ["Comentarios", stats.comments],
            ["Seguidores", stats.followers],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dd className="font-display text-lg font-bold text-foreground">
              {value.toLocaleString("es-ES")}
            </dd>
            <dt className="text-[10px] font-medium tracking-wide text-muted uppercase">{label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
