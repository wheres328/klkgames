import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getSiteSettings } from "@/server/services/siteSettingsService";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Condiciones de uso de esta plataforma.",
};

const sections = [
  {
    title: "1. Aceptación de los términos",
    body: [
      "Al acceder y utilizar esta plataforma aceptas las presentes condiciones. Si no estás de acuerdo con ellas, te pedimos que no utilices el servicio.",
    ],
  },
  {
    title: "2. Cuenta",
    body: [
      "Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra en tu cuenta.",
      "La cuenta debe estar activa para participar en la comunidad: valorar, comentar y guardar favoritos.",
    ],
  },
  {
    title: "3. Contenido de la comunidad",
    body: [
      "Los comentarios y valoraciones deben ser respetuosos. El equipo de administración puede ocultar o eliminar contenido que vulnere estas normas.",
      "El catálogo de juegos y sus imágenes se muestran con fines informativos y pertenecen a sus respectivos autores.",
    ],
  },
  {
    title: "4. Conducta prohibida",
    body: [
      "Queda prohibido el uso de la plataforma para actividades ilegales, el acoso, la suplantación de identidad, el envío de spam o cualquier intento de comprometer la seguridad del servicio.",
      "Las cuentas que vulneren estas normas pueden ser suspendidas o eliminadas.",
    ],
  },
  {
    title: "5. Limitación de responsabilidad",
    body: [
      "La plataforma se ofrece «tal cual». No garantizamos que el servicio esté disponible sin interrupciones ni que la información del catálogo esté siempre actualizada.",
    ],
  },
  {
    title: "6. Modificaciones",
    body: [
      "Podemos actualizar estos términos cuando sea necesario. Los cambios se publicarán en esta misma página con su fecha de actualización.",
    ],
  },
];

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Términos de uso
        </h1>
        <p className="mt-2 text-sm text-muted">Última actualización: agosto de 2026</p>

        <div className="mt-8 flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <p className="text-sm leading-relaxed text-muted">
            Para consultas sobre estos términos, contacta con nosotros en{" "}
            <a
              href={`mailto:${settings.contactEmail ?? ""}`}
              className="font-semibold text-accent transition-colors hover:text-accent-2"
            >
              {settings.contactEmail ?? "contacto@vortex.example.com"}
            </a>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
