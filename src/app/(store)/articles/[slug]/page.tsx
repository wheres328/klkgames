import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Hash } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { GameCard } from "@/components/cards/GameCard";
import { formatDate } from "@/lib/format";
import {
  getArticleBySlug,
  listPublishedArticles,
  listPublishedArticleSlugs,
} from "@/server/services/articleService";
import { getGamesBySlugs } from "@/server/services/gameService";

export interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listPublishedArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artículo no encontrado" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(slug),
    listPublishedArticles(),
  ]);
  if (!article) notFound();

  const relatedGames = await getGamesBySlugs(article.relatedGames);

  const otherArticles = allArticles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="py-10">
      <Container className="max-w-4xl">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a artículos
        </Link>

        <header className="mt-6">
          <Tag>{article.category}</Tag>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{article.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-border py-4 text-sm">
            <Avatar src={article.author.avatar} name={article.author.name} size="sm" />
            <span className="font-semibold text-foreground">{article.author.name}</span>
            <span className="text-muted">·</span>
            <time dateTime={article.publishedAt} className="text-muted">
              {formatDate(article.publishedAt, "long")}
            </time>
            <span className="inline-flex items-center gap-1 text-muted">
              <Clock className="size-4" aria-hidden />
              {article.readTime} de lectura
            </span>
          </div>
        </header>

        <div className="relative mt-8 aspect-video overflow-hidden rounded-card border border-border bg-surface">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        <article className="mt-8 space-y-5 text-base leading-relaxed text-foreground">
          {article.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Hash className="size-4 text-muted" aria-hidden />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-pill border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {relatedGames.length > 0 && (
          <section className="mt-14">
            <SectionHeader
              title="Juegos relacionados"
              description="Títulos mencionados en este artículo."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-14">
          <SectionHeader title="Más artículos" />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {otherArticles.map((other) => (
              <ArticleCard key={other.id} article={other} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
