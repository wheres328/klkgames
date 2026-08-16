import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GenreCard } from "@/components/cards/GenreCard";
import type { Genre } from "@/types/genre";

export interface GenreSectionProps {
  genres: Genre[];
}

export function GenreSection({ genres }: GenreSectionProps) {
  const visible = genres.slice(0, 8);
  if (visible.length === 0) return null;

  return (
    <section className="mt-16">
      <Container>
        <SectionHeader
          eyebrow="Categorías"
          title="Explora por género"
          description="Desde supervivencia hasta roguelikes: encuentra tu próxima obsesión."
          action={{ label: "Todos los géneros", href: "/genres" }}
        />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      </Container>
    </section>
  );
}
