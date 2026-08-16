"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  panelClassName?: string;
}

export function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  panelClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex"
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-2 min-w-48 rounded-card border border-border bg-surface p-1.5 shadow-2xl shadow-black/40",
            align === "right" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
}

export function DropdownItem({ children, onSelect, className }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-input px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-raised",
        className,
      )}
    >
      {children}
    </button>
  );
}
