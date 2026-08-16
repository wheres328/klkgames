import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GameRowList } from "@/components/cards/GameRowList";
import type { Game } from "@/types/game";

export interface TrendingSectionProps {
  games: Game[];
}

export function TrendingSection({ games }: TrendingSectionProps) {
  if (games.length === 0) return null;

  return (
    <section className="mt-16">
      <Container>
        <SectionHeader
          eyebrow="En tendencia"
          title="Juegos en tendencia"
          description="Lo que la comunidad está jugando más ahora mismo, ordenado por popularidad."
          action={{ label: "Ver todos", href: "/games" }}
        />
        <div className="mt-6">
          <GameRowList games={games} rank withHeader />
        </div>
      </Container>
    </section>
  );
}
