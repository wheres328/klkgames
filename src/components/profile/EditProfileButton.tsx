"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { updateOwnProfile } from "@/server/actions/profile";

export interface EditableProfile {
  name: string;
  bio: string;
  avatar: string;
  cover: string;
  username: string;
}

interface EditProfileButtonProps {
  profile: EditableProfile;
}

export function EditProfileButton({ profile }: EditProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [cover, setCover] = useState(profile.cover);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const reset = () => {
    setName(profile.name);
    setBio(profile.bio);
    setAvatar(profile.avatar);
    setCover(profile.cover);
    setError(null);
  };

  const handleOpen = () => {
    reset();
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await updateOwnProfile({ name, bio, image: avatar, cover });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await authClient.updateUser({
        name: name.trim(),
        image: avatar.trim() || undefined,
      });
      toast({ title: "Perfil actualizado", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Error al guardar el perfil.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleOpen}>
        <Pencil className="size-4" aria-hidden />
        Editar perfil
      </Button>

      {open ? (
        <Dialog open onClose={() => setOpen(false)} title="Editar perfil">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Biografía</label>
              <textarea
                className="min-h-24 w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Cuéntanos algo sobre ti…"
                maxLength={500}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input
                  label="Imagen de avatar (URL)"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                />
                {avatar ? (
                  <div className="relative mt-2 aspect-square w-20 overflow-hidden rounded-input border border-border">
                    <Image src={avatar} alt="Vista previa del avatar" fill sizes="80px" className="object-cover" />
                  </div>
                ) : null}
              </div>
              <div>
                <Input
                  label="Imagen de portada (URL)"
                  placeholder="https://..."
                  value={cover}
                  onChange={(event) => setCover(event.target.value)}
                />
                {cover ? (
                  <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-input border border-border">
                    <Image src={cover} alt="Vista previa de la portada" fill sizes="200px" className="object-cover" />
                  </div>
                ) : null}
              </div>
            </div>

            <p className="text-xs text-muted">
              Deja vacío para usar la imagen por defecto. El perfil se verá en{" "}
              <span className="font-semibold text-foreground">/usuarios/{profile.username}</span>.
            </p>

            {error ? (
              <p
                role="alert"
                className="rounded-input border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
              >
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={pending}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
}
