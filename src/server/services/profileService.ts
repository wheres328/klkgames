import { db } from "@/lib/db";
import { getUserByUsername } from "@/server/services/userService";
import { getProfileBadges } from "@/server/services/badgeService";
import {
  getReputationHistory,
  getReputationLevel,
  type ReputationLogEntry,
} from "@/server/services/reputationService";
import type { User } from "@/types/user";
import type { UserBadgeView } from "@/types/badge";

export interface FavoriteGameRef {
  slug: string;
  name: string;
  cover: string;
}

export interface UserProfile {
  user: User;
  badges: UserBadgeView[];
  stats: { favorites: number; comments: number; ratings: number };
  favoriteGames: FavoriteGameRef[];
  rank: { name: string; color: string | null } | null;
  reputation: {
    points: number;
    level: string;
    history: ReputationLogEntry[];
  };
  application: {
    id: string;
    status: string;
    message: string;
    reviewNote: string | null;
    reputationAtSubmit: number;
    createdAt: Date;
    reviewedAt: Date | null;
    reviewerName: string | null;
  } | null;
}

export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;

  const [badges, stats, comments, ratings, favorites, history, application, rank] =
    await Promise.all([
      getProfileBadges(user.id),
      db.favorite.aggregate({ where: { userId: user.id }, _count: { _all: true } }),
      db.comment.count({ where: { authorId: user.id, deletedAt: null } }),
      db.gameRating.count({ where: { userId: user.id } }),
      db.favorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          game: {
            select: {
              slug: true,
              name: true,
              images: {
                where: { type: "COVER" },
                orderBy: { order: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      }),
      getReputationHistory(user.id, 12),
      db.adminApplication.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          message: true,
          reviewNote: true,
          reputationAtSubmit: true,
          createdAt: true,
          reviewedAt: true,
          reviewer: { select: { name: true } },
        },
      }),
      db.rank.findFirst({
        where: { users: { some: { id: user.id } } },
        select: { name: true, color: true },
      }),
    ]);

  return {
    user,
    badges: badges.earned,
    stats: {
      favorites: stats._count._all,
      comments,
      ratings,
    },
    favoriteGames: favorites.map((favorite) => ({
      slug: favorite.game.slug,
      name: favorite.game.name,
      cover: favorite.game.images[0]?.url ?? "",
    })),
    rank: rank ? { name: rank.name, color: rank.color } : null,
    reputation: {
      points: user.reputation ?? 0,
      level: getReputationLevel(user.reputation ?? 0).title,
      history,
    },
    application: application
      ? {
          id: application.id,
          status: application.status,
          message: application.message,
          reviewNote: application.reviewNote,
          reputationAtSubmit: application.reputationAtSubmit,
          createdAt: application.createdAt,
          reviewedAt: application.reviewedAt,
          reviewerName: application.reviewer?.name ?? null,
        }
      : null,
  };
}
