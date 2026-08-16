import { db } from "@/lib/db";
import { $Enums } from "@/generated/prisma/client";
import { createAuditLog, serializeForAudit } from "@/server/services/auditService";
import type { Donation, DonationPlatform } from "@/types/donation";
import type { DonationInput } from "@/server/validation/donationValidation";

function toDonationView(row: {
  id: string;
  platform: $Enums.DonationPlatform;
  url: string;
  label: string | null;
  address: string | null;
  order: number;
  active: boolean;
  createdAt: Date;
}): Donation {
  return {
    id: row.id,
    platform: row.platform as DonationPlatform,
    url: row.url,
    label: row.label,
    address: row.address,
    order: row.order,
    active: row.active,
    createdAt: row.createdAt,
  };
}

export async function listDonations(options: { activeOnly?: boolean } = {}): Promise<Donation[]> {
  const rows = await db.donation.findMany({
    where: options.activeOnly ? { active: true } : {},
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toDonationView);
}

export async function getDonationById(id: string): Promise<Donation | null> {
  const row = await db.donation.findUnique({ where: { id } });
  return row ? toDonationView(row) : null;
}

export async function createDonation(
  input: DonationInput,
  options?: { actorId?: string },
): Promise<Donation> {
  const row = await db.donation.create({
    data: {
      platform: input.platform as $Enums.DonationPlatform,
      url: input.url,
      label: input.label ?? null,
      address: input.address ?? null,
      order: input.order,
      active: input.active ?? true,
    },
  });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "CREATE_DONATION",
    entityType: "Donation",
    entityId: row.id,
    after: serializeForAudit({ platform: row.platform, url: row.url, active: row.active }),
  });
  return toDonationView(row);
}

export async function updateDonation(
  id: string,
  input: DonationInput,
  options?: { actorId?: string },
): Promise<Donation> {
  const before = await db.donation.findUnique({
    where: { id },
    select: { id: true, platform: true, url: true, label: true, address: true, order: true, active: true },
  });
  if (!before) throw new Error("Donación no encontrada.");

  const row = await db.donation.update({
    where: { id },
    data: {
      platform: input.platform as $Enums.DonationPlatform,
      url: input.url,
      label: input.label ?? null,
      address: input.address ?? null,
      order: input.order,
      active: input.active ?? before.active,
    },
  });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "UPDATE_DONATION",
    entityType: "Donation",
    entityId: id,
    before: serializeForAudit(before),
    after: serializeForAudit({ platform: row.platform, url: row.url, active: row.active, order: row.order }),
  });
  return toDonationView(row);
}

export async function deleteDonation(id: string, options?: { actorId?: string }): Promise<void> {
  const before = await db.donation.findUnique({
    where: { id },
    select: { id: true, platform: true, url: true },
  });
  if (!before) throw new Error("Donación no encontrada.");

  await db.donation.delete({ where: { id } });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "DELETE_DONATION",
    entityType: "Donation",
    entityId: id,
    before: serializeForAudit(before),
  });
}
