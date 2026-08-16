import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { getSiteSettings } from "@/server/services/siteSettingsService";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");
  if (user.role !== "ADMIN") redirect("/");

  const settings = await getSiteSettings();

  return (
    <AdminShell
      user={{ name: user.name, avatar: user.image ?? "", username: user.username }}
      siteName={settings.name}
      siteLogoUrl={settings.logoUrl}
    >
      {children}
    </AdminShell>
  );
}
