import Link from "next/link";
import { HandHeart } from "lucide-react";
import { listAdminApplicationsAdmin } from "@/server/services/adminService";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApplicationReviewButtons } from "@/components/admin/ApplicationReviewButtons";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdminApplicationsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

const STATUS_TONES: Record<string, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  const params = await searchParams;
  const status = params.status ?? "PENDING";
  const applications = await listAdminApplicationsAdmin(status);

  const counts = await Promise.all([
    listAdminApplicationsAdmin("PENDING"),
    listAdminApplicationsAdmin("APPROVED"),
    listAdminApplicationsAdmin("REJECTED"),
  ]);

  const tabs: Array<{ key: string; label: string }> = [
    { key: "PENDING", label: `Pendientes (${counts[0].length})` },
    { key: "APPROVED", label: `Aprobadas (${counts[1].length})` },
    { key: "REJECTED", label: `Rechazadas (${counts[2].length})` },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Candidaturas"
        description="Usuarios que quieren formar parte del equipo de la comunidad."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/candidaturas?status=${tab.key}`}
            className={
              status === tab.key
                ? "rounded-input border border-accent/60 bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent-2"
                : "rounded-input border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={HandHeart}
          title="Sin postulaciones"
          description="Nadie ha solicitado unirse al equipo todavía."
        />
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-card border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/usuarios/${application.user.username}`}
                      className="font-semibold text-foreground transition-colors hover:text-accent"
                    >
                      {application.user.name}
                      <span className="ml-1 text-xs font-normal text-muted">
                        @{application.user.username}
                      </span>
                    </Link>
                    <p className="text-xs text-muted">
                      {formatDate(application.createdAt)} · {application.reputationAtSubmit} pts de
                      reputación
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_TONES[application.status]}>
                  {STATUS_LABELS[application.status] ?? application.status}
                </Badge>
              </div>

              {application.message ? (
                <blockquote className="mt-3 rounded-input border-l-2 border-accent bg-surface-raised px-3 py-2 text-sm text-muted">
                  {application.message}
                </blockquote>
              ) : null}

              {application.status === "REJECTED" && application.reviewNote ? (
                <p className="mt-2 rounded-input border border-border bg-surface-raised px-3 py-2 text-xs text-muted">
                  <span className="font-semibold text-foreground">Motivo:</span>{" "}
                  {application.reviewNote}
                </p>
              ) : null}

              {application.status === "APPROVED" && application.reviewer ? (
                <p className="mt-2 text-xs text-muted">
                  Revisada por <span className="font-semibold text-foreground">{application.reviewer.name}</span>
                </p>
              ) : null}

              {application.status === "PENDING" ? (
                <div className="mt-3 max-w-md">
                  <ApplicationReviewButtons applicationId={application.id} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
