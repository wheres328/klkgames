import Image from "next/image";
import type { UserBadgeView } from "@/types/badge";

export function BadgeTile({ badge }: { badge: UserBadgeView }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-4 text-center transition-colors hover:border-accent/40">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-input border border-border bg-surface-raised">
        <Image
          src={badge.badge.image}
          alt={badge.badge.name}
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{badge.badge.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{badge.badge.description}</p>
        {badge.awardedBy ? (
          <p className="mt-1.5 text-[10px] text-muted/70">
            Otorgada por <span className="font-semibold text-foreground/80">{badge.awardedBy.name}</span>
          </p>
        ) : null}
        {badge.reason ? (
          <p className="mt-1 text-[10px] italic text-muted/70">{badge.reason}</p>
        ) : null}
      </div>
    </div>
  );
}
