import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { listPublishedArticles } from "@/server/services/articleService";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Artículos",
  description: `Guías, análisis y especiales de ${siteConfig.name} para ayudarte a elegir y exprimir cada juego.`,
};

export default async function ArticlesPage() {
  const articles = await listPublishedArticles();
  const [featured, ...rest] = articles;

  if (articles.length === 0) {
    return (
      <div className="py-10">
        <Container>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">La revista</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Artículos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Guías, listas, análisis y especiales escritos por la redacción y la comunidad.
          </p>
          <EmptyState
            title="Todavía no hay artículos"
            description="La redacción está preparando los primeros guías y especiales. Vuelve pronto."
            className="mt-8"
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="py-10">
      <Container>
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">La revista</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Artículos
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Guías, listas, análisis y especiales escritos por la redacción y la comunidad.
        </p>

        <div className="mt-8">
          <ArticleCard article={featured} featured />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Container>
    </div>
  );
}
