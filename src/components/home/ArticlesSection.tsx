import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { ArticleRow } from "@/components/cards/ArticleRow";
import type { Article } from "@/types/article";

export interface ArticlesSectionProps {
  featured?: Article;
  rest: Article[];
}

export function ArticlesSection({ featured, rest }: ArticlesSectionProps) {
  if (!featured && rest.length === 0) return null;

  return (
    <section className="mt-16">
      <Container>
        <SectionHeader
          eyebrow="La revista"
          title="Artículos recientes"
          description="Guías, análisis y especiales escritos por la comunidad y la redacción."
          action={{ label: "Ver todos", href: "/articles" }}
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {featured && <ArticleCard article={featured} featured className="h-full" />}
          <div className="flex flex-col gap-3">
            {rest.slice(0, 4).map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
