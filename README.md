# KLKgames

Plataforma web de videojuegos: catálogo, fichas técnicas, requisitos, descargas, artículos, comunidad y panel de administración completo. Construida con **Next.js 16 (App Router)** + **Prisma 7** + **PostgreSQL** + **Better Auth**.

> Proyecto académico/demo. No distribuye contenido real.

## Características

- **Catálogo de juegos**: búsqueda con autocompletado, filtros por género/plataforma, fichas con requisitos, videos y enlaces de descarga.
- **Comunidad**: valoraciones, comentarios (con likes), favoritos, perfiles de usuario y reputación.
- **Sistema de reputación**: los usuarios ganan puntos comentando, recibiendo likes y valorando juegos; a partir de cierto umbral pueden postularse como **candidatos a moderador**.
- **Rangos y permisos**: catálogo de permisos (contenido, moderación, administración) agrupados en rangos gestionables desde el panel; los moderadores y rangos ejercen sus permisos sin depender de roles fijos.
- **Panel de administración** (`/dashboard`): estadísticas, gestión de juegos/artículos/usuarios, comentarios y reportes, medallas, ajustes del sitio, redes sociales, donaciones y rangos.
- **Donaciones**: enlaces editables desde el panel (Patreon, PayPal, cripto) y página pública `/donar`.
- **Auditoría**: registro de acciones administrativas (`AuditLog`).

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Components) |
| ORM | Prisma 7 + Prisma Client (driver `pg` con PostgreSQL) |
| Autenticación | Better Auth (email/contraseña con bcrypt, sesiones de 7 días) |
| Validación | Zod 4 |
| Estilos | Tailwind CSS 4 + `cva`/`clsx`/`tailwind-merge` |
| Iconos | lucide-react |
| Lint/Format | ESLint 9 + Prettier |

## Requisitos

- Node.js 20+
- PostgreSQL 15+ (local o Docker)

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Configurar variables de entorno. Copia `.env.example` a `.env` y rellena `DATABASE_URL` y `AUTH_SECRET` (genera uno con `npx @better-auth/cli secret`):

   ```bash
   Copy-Item .env.example .env
   ```

3. Aplicar las migraciones y generar el cliente Prisma:

   ```bash
   npm run db:migrate
   npm run db:generate
   ```

4. (Opcional) Sembrar la base de datos con datos de demostración:

   ```bash
   npm run db:seed:demo
   ```

   Credenciales del admin demo: `admin@vortex.com` / `Admin123!`

5. Lanzar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run format` | Formatear con Prettier |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:generate` | Regenerar el cliente Prisma |
| `npm run db:seed` | Seed base |
| `npm run db:seed:demo` | Seed con datos demo |
| `npm run db:studio` | Abrir Prisma Studio |

## Estructura

```
prisma/
  schema.prisma          # Modelos de datos
  migrations/            # Migraciones SQL
  seeds/                 # Seeds (base, demo, mock)
src/
  app/                   # Rutas (App Router)
    (auth)/              # Login, registro
    (store)/             # Tienda pública: home, juegos, artículos, donar, perfiles…
    (admin)/dashboard/   # Panel de administración
  components/            # UI (ui/, layout/, admin/, profile/, game-detail/…)
  lib/                   # Infraestructura: auth, db, utils
  server/
    actions/             # Server Actions
    services/            # Capa de servicios (dominio)
    auth/                # Sesión actual
    validation/          # Esquemas Zod
  types/                 # Tipos compartidos
  config/                # Config del sitio
```

## Seguridad

- Contraseñas con bcrypt (cost 10) — hash compatible con la BD.
- El campo `role` no es modificable desde el cliente (`input: false` en Better Auth); los cambios de rol solo se aplican desde el servidor.
- Panel `/dashboard` restringido a `ADMIN` en el layout.
- Permisos granulares por rango evaluados en las Server Actions (no solo en la UI).
- Headers de seguridad (CSP básica, `nosniff`, `DENY` frames, `Permissions-Policy`) en `next.config.ts`.

## Licencia

[MIT](./LICENSE)
