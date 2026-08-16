import type { UserSummary } from "./user";

export interface Comment {
  id: string;
  user: UserSummary;
  date: string;
  content: string;
  likes: number;
  likedByViewer?: boolean;
  rating?: number;
  edited?: boolean;
  replies: Comment[];
}
