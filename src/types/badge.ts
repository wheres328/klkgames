export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
}

export interface UserBadgeView {
  id: string;
  badge: Badge;
  awardedBy: { name: string; username: string } | null;
  reason: string | null;
  awardedAt: string;
}
