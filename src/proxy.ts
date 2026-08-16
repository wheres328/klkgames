import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Nombre de la cookie de sesión de Better Auth (advanced.cookiePrefix = "vortex").
const SESSION_COOKIE = "vortex.session_token";

// Rutas exclusivas de autenticación (visibles solo sin sesión).
const authRoutes = ["/login", "/register"];

// Rutas que exigen sesión.
const protectedRoutes = ["/favorites", "/account", "/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Sin sesión en rutas de auth → redirigir a la home.
  if (authRoutes.includes(pathname)) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Rutas protegidas: sin sesión → /login conservando el destino.
  if (protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    if (!hasSession) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
