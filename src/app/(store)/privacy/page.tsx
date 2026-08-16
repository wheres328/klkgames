import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getSiteSettings } from "@/server/services/siteSettingsService";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo tratamos tus datos en esta plataforma.",
};

const sections = [
  {
    title: "1. Datos que recogemos",
    body: [
      "Recogemos los datos que nos facilitas al registrarte (nombre de usuario, correo electrónico y contraseña cifrada) y los que generas al usar la plataforma: juegos en favoritos, valoraciones, comentarios y actividad en el catálogo.",
      "Los datos de acceso se registran únicamente para mantener la seguridad de la cuenta y del servicio.",
    ],
  },
  {
    title: "2. Uso de los datos",
    body: [
      "Usamos tus datos para personalizar tu experiencia, gestionar tu cuenta, mostrar tu actividad pública en la comunidad y mantener el funcionamiento técnico del sitio.",
      "No vendemos ni cedemos tus datos personales a terceros con fines comerciales.",
    ],
  },
  {
    title: "3. Almacenamiento y seguridad",
    body: [
      "Las contraseñas se almacenan cifradas y el acceso a la administración queda registrado en un registro de auditoría.",
      "Puedes solicitar la rectificación o eliminación de tus datos en cualquier momento contactando con el equipo.",
    ],
  },
  {
    title: "4. Cookies",
    body: [
      "Este sitio usa cookies técnicas y de sesión necesarias para iniciar sesión y recordar tus preferencias. No usamos cookies de publicidad de terceros.",
    ],
  },
  {
    title: "5. Tus derechos",
    body: [
      "Puedes acceder, rectificar o eliminar tus datos personales, así como solicitar la portabilidad o limitar el tratamiento, escribiéndonos a la dirección de contacto que aparece en la página de contacto.",
    ],
  },
];

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Política de privacidad
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
            Si tienes preguntas sobre esta política, escríbenos a{" "}
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
