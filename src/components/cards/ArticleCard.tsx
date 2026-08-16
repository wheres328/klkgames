import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/types/article";
import { Tag } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ArticleCardProps {
  article: Article;
  className?: string;
  featured?: boolean;
}

export function ArticleCard({ article, className, featured = false }: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-black/30",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "aspect-video" : "aspect-[16/10]")}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Tag className="absolute top-3 left-3">{article.category}</Tag>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-muted">
          <Avatar src={article.author.avatar} name={article.author.name} size="sm" />
          <span className="font-medium text-foreground">{article.author.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          <span className="ml-auto inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {article.readTime}
          </span>
        </div>

        <h3
          className={cn(
            "font-display mt-3 font-bold tracking-tight text-foreground transition-colors group-hover:text-accent",
            featured ? "text-2xl leading-tight" : "text-lg leading-snug",
          )}
        >
          <Link href={`/articles/${article.slug}`}>
            <span className="absolute inset-0" aria-hidden />
            {article.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
      </div>
    </article>
  );
}
