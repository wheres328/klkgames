"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import type { UserSummary } from "@/types/user";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { createComment } from "@/server/actions/community";

export interface CommentComposerProps {
  currentUser: UserSummary;
  gameId?: string;
  articleId?: string;
}

export function CommentComposer({ currentUser, gameId, articleId }: CommentComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || pending) return;
    setPending(true);
    try {
      const result = await createComment({ gameId, articleId, content });
      if (result.ok) {
        setContent("");
        toast({
          title: "Comentario publicado",
          description: "Tu opinión se ha añadido a la conversación.",
          variant: "success",
        });
        router.refresh();
      } else {
        toast({ title: result.error, variant: "error" });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-card border border-border bg-surface p-4"
      aria-label="Escribir comentario"
    >
      <div className="flex items-start gap-3">
        <Avatar src={currentUser.avatar} name={currentUser.name} />
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={3}
            placeholder="Comparte tu opinión sobre este juego…"
            className="w-full resize-none rounded-input border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted">Sé respetuoso con la comunidad.</span>
            <button
              type="submit"
              disabled={!content.trim() || pending}
              className="inline-flex items-center gap-2 rounded-card bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden />
              {pending ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
