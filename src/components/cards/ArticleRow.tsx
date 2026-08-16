import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Article } from "@/types/article";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ArticleRowProps {
  article: Article;
  className?: string;
}

// Fila editorial compacta (Formato D): imagen pequeña + información textual.
// Para Home, secciones de novedades y listados de artículos.
export function ArticleRow({ article, className }: ArticleRowProps) {
  return (
    <article
      className={cn(
        "group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-card border border-border bg-surface p-2.5 transition-all duration-200 hover:border-accent/40 hover:bg-surface-raised",
        className,
      )}
    >
      <Link
        href={`/articles/${article.slug}`}
        aria-label={article.title}
        className="relative block"
      >
        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-input border border-border">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="truncate rounded-pill bg-accent/10 px-2 py-0.5 font-semibold text-accent-2">
            {article.category}
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Clock className="size-3" aria-hidden />
            {article.readTime}
          </span>
        </div>
        <h3 className="mt-1 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
          <Link href={`/articles/${article.slug}`} className="line-clamp-1">
            {article.title}
          </Link>
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
          <Avatar src={article.author.avatar} name={article.author.name} size="sm" />
          <span className="truncate">{article.author.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={article.publishedAt} className="shrink-0">
            {formatDate(article.publishedAt)}
          </time>
          <ArrowUpRight
            className="ml-auto size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
