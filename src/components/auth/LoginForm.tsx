"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    });

    if (signInError) {
      setError(
        signInError.code === "INVALID_EMAIL_OR_PASSWORD"
          ? "Email o contraseña incorrectos."
          : (signInError.message ?? "No se pudo iniciar sesión."),
      );
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-2xl shadow-black/40">
      <div className="mb-6 text-center">
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
          Bienvenido de nuevo
        </h1>
        <p className="mt-1 text-sm text-muted">
          Inicia sesión para guardar favoritos y participar en la comunidad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          type="email"
          label="Email"
          placeholder="tu@email.com"
          autoComplete="email"
          leadingIcon={<Mail className="size-4" aria-hidden />}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          leadingIcon={<Lock className="size-4" aria-hidden />}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? (
          <p
            role="alert"
            className="rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" loading={loading} className="mt-1 w-full">
          {loading ? null : <LogIn className="size-4" aria-hidden />}
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-semibold text-accent transition-colors hover:text-accent-2"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
