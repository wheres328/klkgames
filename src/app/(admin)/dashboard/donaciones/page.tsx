import { Coins } from "lucide-react";
import { listDonations } from "@/server/services/donationService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DonationEditor } from "@/components/admin/DonationEditor";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DONATION_PLATFORM_LABELS } from "@/components/admin/constants";

export default async function AdminDonationsPage() {
  const donations = await listDonations();

  return (
    <div>
      <AdminPageHeader
        title="Donaciones"
        description="Canales para que la comunidad apoye el proyecto (Patreon, PayPal, criptomonedas)."
      />

      <section className="mb-6">
        <h2 className="font-display mb-3 text-sm font-bold tracking-tight text-foreground">
          Nueva donación
        </h2>
        <DonationEditor />
      </section>

      <section>
        <h2 className="font-display mb-3 text-sm font-bold tracking-tight text-foreground">
          Canales existentes ({donations.length})
        </h2>
        {donations.length === 0 ? (
          <EmptyState
            icon={Coins}
            title="Sin canales todavía"
            description="Crea tu primera donación para mostrarla en el sitio."
          />
        ) : (
          <div className="space-y-3">
            {donations.map((donation) => (
              <div key={donation.id} className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Badge variant={donation.active ? "success" : "neutral"}>
                    {donation.active ? "Visible" : "Oculta"}
                  </Badge>
                  <span className="font-semibold text-foreground">
                    {DONATION_PLATFORM_LABELS[donation.platform] ?? donation.platform}
                  </span>
                  <span className="truncate">{donation.url}</span>
                </div>
                <DonationEditor donation={donation} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
