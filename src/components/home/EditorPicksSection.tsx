import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeaturedGameCard } from "@/components/cards/FeaturedGameCard";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import type { Game } from "@/types/game";

export interface EditorPicksSectionProps {
  featured: Game | undefined;
  rest: Game[];
}

export function EditorPicksSection({ featured, rest }: EditorPicksSectionProps) {
  if (!featured && rest.length === 0) return null;

  return (
    <section className="mt-16">
      <Container>
        <SectionHeader
          eyebrow="La editorial recomienda"
          title="Elección de la editorial"
          description="Selección curada por nuestro equipo con las mejores experiencias de la semana."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {featured && <FeaturedGameCard game={featured} />}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {rest.map((game) => (
              <RecommendationCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
