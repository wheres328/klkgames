export type DonationPlatform = "PATREON" | "PAYPAL" | "CRYPTO";

export interface Donation {
  id: string;
  platform: DonationPlatform;
  url: string;
  label: string | null;
  address: string | null;
  order: number;
  active: boolean;
  createdAt: Date;
}
