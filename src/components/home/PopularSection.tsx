import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GameRowList } from "@/components/cards/GameRowList";
import type { Game } from "@/types/game";

export interface PopularSectionProps {
  mostPopular: Game[];
  topRated: Game[];
}

export function PopularSection({ mostPopular, topRated }: PopularSectionProps) {
  if (mostPopular.length === 0 && topRated.length === 0) return null;

  return (
    <section className="mt-16">
      <Container>
        <SectionHeader
          eyebrow="Los más populares"
          title="Lo más jugado del catálogo"
          description="Los títulos con más valoraciones y mejor recibidos por la comunidad."
          action={{ label: "Explorar catálogo", href: "/games" }}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
              Más populares
            </p>
            <GameRowList games={mostPopular} rank />
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
              Mejor valorados
            </p>
            <GameRowList games={topRated} rank />
          </div>
        </div>
      </Container>
    </section>
  );
}
