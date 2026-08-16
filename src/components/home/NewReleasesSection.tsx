import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GameRowList } from "@/components/cards/GameRowList";
import type { Game } from "@/types/game";

export interface NewReleasesSectionProps {
  games: Game[];
}

export function NewReleasesSection({ games }: NewReleasesSectionProps) {
  if (games.length === 0) return null;

  return (
    <section className="mt-16">
      <Container>
        <SectionHeader
          eyebrow="Novedades"
          title="Últimos lanzamientos"
          description="Los juegos más recientes que ya puedes jugar en la plataforma."
          action={{ label: "Ver catálogo", href: "/games" }}
        />
        <div className="mt-6">
          <GameRowList games={games} showDate withHeader />
        </div>
      </Container>
    </section>
  );
}
