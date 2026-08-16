import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { UserCard } from "@/components/cards/UserCard";
import type { CommunityMember } from "@/server/services/userService";

export interface CommunitySectionProps {
  members: CommunityMember[];
}

export function CommunitySection({ members }: CommunitySectionProps) {
  return (
    <section id="comunidad" className="mt-16 scroll-mt-24">
      <Container>
        <SectionHeader
          eyebrow="Comunidad"
          title="Jugadores activos"
          description="Comparte análisis, valora tus juegos favoritos y participa en la conversación."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {members.map(({ user, stats }) => (
            <UserCard key={user.id} user={user} stats={stats} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-card border border-border bg-surface p-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-card bg-accent/10 text-accent">
              <MessageSquareText className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display font-semibold text-foreground">
                ¿Juegas lo mismo que nosotros?
              </p>
              <p className="text-sm text-muted">
                Comparte tu opinión en los comentarios de cada juego.
              </p>
            </div>
          </div>
          <Link
            href="/games"
            className="inline-flex shrink-0 items-center justify-center rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
          >
            Unirse a la conversación
          </Link>
        </div>
      </Container>
    </section>
  );
}
