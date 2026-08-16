"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, Lock, Mail, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function RegisterForm({ siteName = "la tienda" }: { siteName?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (name.trim().length < 2) return "El nombre debe tener al menos 2 caracteres.";
    if (!USERNAME_PATTERN.test(username))
      return "El nombre de usuario debe tener 3–20 caracteres (letras, números o _).";
    if (!EMAIL_PATTERN.test(email)) return "Introduce un email válido.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (password !== confirmPassword) return "Las contraseñas no coinciden.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const { error: signUpError } = await authClient.signUp.email({
      name: name.trim(),
      username: username.trim(),
      email,
      password,
      callbackURL: "/",
    });

    if (signUpError) {
      setError(
        signUpError.code === "USER_ALREADY_EXISTS"
          ? "Ya existe una cuenta con ese email."
          : (signUpError.message ?? "No se pudo crear la cuenta."),
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-2xl shadow-black/40">
      <div className="mb-6 text-center">
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
          Crear tu cuenta
        </h1>
        <p className="mt-1 text-sm text-muted">
          �nete a {siteName} y descubre tu pr�ximo juego favorito.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nombre"
          placeholder="Tu nombre"
          autoComplete="name"
          leadingIcon={<UserRound className="size-4" aria-hidden />}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          label="Nombre de usuario"
          placeholder="tu_usuario"
          autoComplete="username"
          leadingIcon={<AtSign className="size-4" aria-hidden />}
          hint="3–20 caracteres: letras, números o _"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
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
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          leadingIcon={<Lock className="size-4" aria-hidden />}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Input
          type="password"
          label="Confirmar contraseña"
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          leadingIcon={<Lock className="size-4" aria-hidden />}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
          Crear cuenta
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent transition-colors hover:text-accent-2"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
