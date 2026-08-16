"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, ThumbsUp } from "lucide-react";
import type { Comment } from "@/types/comment";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { createComment, reportComment, toggleCommentLike } from "@/server/actions/community";
import { cn } from "@/lib/utils";

export interface CommentCardProps {
  comment: Comment;
  className?: string;
  level?: number;
  currentUserId?: string;
  gameId?: string;
  articleId?: string;
}

export function CommentCard({
  comment,
  className,
  level = 0,
  currentUserId,
  gameId,
  articleId,
}: CommentCardProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(comment.likes);
  const [liked, setLiked] = useState(Boolean(comment.likedByViewer));
  const [likePending, setLikePending] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState("");
  const [replyPending, setReplyPending] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState("");
  const [reportPending, setReportPending] = useState(false);
  const { toast } = useToast();

  const requireUser = () => {
    if (currentUserId) return true;
    toast({ title: "Debes iniciar sesión.", variant: "info" });
    return false;
  };

  const toggleLike = async () => {
    if (likePending) return;
    if (!requireUser()) return;
    const previousLiked = liked;
    setLiked((prev) => !prev);
    setLikes((prev) => prev + (previousLiked ? -1 : 1));
    setLikePending(true);
    try {
      const result = await toggleCommentLike({ commentId: comment.id });
      if (!result.ok) {
        setLiked(previousLiked);
        setLikes((prev) => prev + (previousLiked ? 1 : -1));
        toast({ title: result.error, variant: "error" });
      }
    } finally {
      setLikePending(false);
    }
  };

  const submitReply = async () => {
    if (!reply.trim() || replyPending) return;
    if (!requireUser()) return;
    setReplyPending(true);
    try {
      const result = await createComment({
        gameId,
        articleId,
        parentId: comment.id,
        content: reply,
      });
      if (result.ok) {
        setReply("");
        setShowReply(false);
        toast({
          title: "Comentario publicado",
          description: "Tu respuesta se ha enviado.",
          variant: "success",
        });
        router.refresh();
      } else {
        toast({ title: result.error, variant: "error" });
      }
    } finally {
      setReplyPending(false);
    }
  };

  const submitReport = async () => {
    if (!reason.trim() || reportPending) return;
    if (!requireUser()) return;
    setReportPending(true);
    try {
      const result = await reportComment({ commentId: comment.id, reason });
      if (result.ok) {
        setReason("");
        setShowReport(false);
        toast({
          title: "Gracias",
          description: "Hemos recibido tu aviso.",
          variant: "info",
        });
      } else {
        toast({ title: result.error, variant: "error" });
      }
    } finally {
      setReportPending(false);
    }
  };

  return (
    <div className={cn(level > 0 && "ml-6 border-l-2 border-border pl-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar src={comment.user.avatar} name={comment.user.name} size="sm" />
        <div className="min-w-0 flex-1 rounded-card border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{comment.user.name}</span>
            {currentUserId && comment.user.id === currentUserId && (
              <span className="rounded-input bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                TÚ
              </span>
            )}
            <time className="text-xs text-muted">{formatDate(comment.date)}</time>
            {comment.edited && <span className="text-xs text-muted">· editado</span>}
            {comment.rating !== undefined && (
              <span className="ml-auto">
                <RatingStars value={comment.rating} size="sm" />
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-foreground">{comment.content}</p>

          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              onClick={toggleLike}
              disabled={likePending}
              aria-pressed={liked}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium transition-colors disabled:cursor-wait",
                liked ? "text-accent" : "text-muted hover:text-accent",
              )}
            >
              <ThumbsUp className={cn("size-4", liked && "fill-current")} aria-hidden />
              {likes.toLocaleString("es-ES")}
            </button>
            <button
              type="button"
              onClick={() => setShowReply((prev) => !prev)}
              className="text-xs font-medium text-muted transition-colors hover:text-accent"
            >
              Responder
            </button>
            <button
              type="button"
              onClick={() => {
                if (!requireUser()) return;
                setShowReport((prev) => !prev);
              }}
              className="ml-auto inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              <Flag className="size-3.5" aria-hidden /> Reportar
            </button>
          </div>

          {showReply && (
            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitReply();
              }}
            >
              <input
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Escribe una respuesta…"
                className="flex-1 rounded-input border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={!reply.trim() || replyPending}
                className="rounded-input bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {replyPending ? "Enviando…" : "Enviar"}
              </button>
            </form>
          )}

          {showReport && (
            <form
              className="mt-3 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitReport();
              }}
            >
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={2}
                placeholder="Cuéntanos por qué quieres reportar este comentario…"
                className="w-full resize-none rounded-input border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReport(false);
                    setReason("");
                  }}
                  className="rounded-input border border-border px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!reason.trim() || reportPending}
                  className="rounded-input bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reportPending ? "Enviando…" : "Enviar aviso"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((replyItem) => (
            <CommentCard
              key={replyItem.id}
              comment={replyItem}
              level={level + 1}
              currentUserId={currentUserId}
              gameId={gameId}
              articleId={articleId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
