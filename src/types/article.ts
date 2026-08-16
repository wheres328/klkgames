import type { UserSummary } from "./user";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: UserSummary;
  publishedAt: string;
  readTime: string;
  tags: string[];
  content: string[];
  relatedGames: string[];
}
