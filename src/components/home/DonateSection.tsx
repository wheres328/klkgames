import Link from "next/link";
import { Heart } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DonateGrid } from "@/components/donate/DonateGrid";
import { listDonations } from "@/server/services/donationService";

export async function DonateSection() {
  const donations = await listDonations({ activeOnly: true });
  if (donations.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-surface/40 py-14">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            title="Apoya el proyecto"
            description="Con tu aporte mantenemos el sitio en marcha para toda la comunidad."
          />
          <Link
            href="/donar"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-2"
          >
            <Heart className="size-4" aria-hidden />
            Ver todas las opciones
          </Link>
        </div>
        <div className="mt-8">
          <DonateGrid donations={donations} />
        </div>
      </Container>
    </section>
  );
}
