"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { GameVideo } from "@/types/game";
import { Dialog } from "@/components/ui/Dialog";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

export interface VideoSectionProps {
  videos: GameVideo[];
  gameName: string;
}

export function VideoSection({ videos, gameName }: VideoSectionProps) {
  const [selected, setSelected] = useState<GameVideo | null>(null);

  if (videos.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setSelected(video)}
            className="group relative aspect-video overflow-hidden rounded-card border border-border bg-surface text-left transition-colors hover:border-accent/50"
          >
            {video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-surface-raised" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-accent">
                <Play className="ml-0.5 size-6 fill-current" aria-hidden />
              </span>
            </span>
            <span className="absolute bottom-3 left-3 rounded-input bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {video.type.toUpperCase()}
            </span>
            <span className="absolute bottom-3 right-3 max-w-[55%] truncate text-xs font-medium text-white/80">
              {video.title}
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `${gameName} — ${selected.title}` : gameName}
        className="sm:max-w-3xl"
      >
        {selected ? (
          <div className="relative aspect-video overflow-hidden rounded-card border border-border bg-black">
            <VideoPlayer src={selected.url} title={selected.title} />
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
