export type UserRole = "user" | "moderator" | "admin";

export interface UserSummary {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface User extends UserSummary {
  role: UserRole;
  bio?: string;
  cover?: string;
  reputation?: number;
  createdAt?: string;
}
