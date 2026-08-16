import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSiteSettings } from "@/server/services/siteSettingsService";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default async function RegisterPage() {
  const settings = await getSiteSettings();

  return (
    <div className="w-full max-w-sm">
      <RegisterForm siteName={settings.name} />
    </div>
  );
}
