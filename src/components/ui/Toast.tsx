"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantIcon = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

const variantAccent = {
  success: "text-success",
  error: "text-danger",
  info: "text-accent-2",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback((options: ToastOptions) => {
    const id = ++counter.current;
    const duration = options.duration ?? 4000;
    setItems((prev) => [
      ...prev,
      {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? "info",
      },
    ]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {items.length > 0
        ? createPortal(
            <div
              aria-live="polite"
              className="fixed bottom-20 right-4 z-[110] flex w-full max-w-sm flex-col gap-2 sm:bottom-4"
            >
              {items.map((item) => {
                const Icon = variantIcon[item.variant];
                return (
                  <div
                    key={item.id}
                    role="status"
                    className="animate-toast-in flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-2xl shadow-black/50"
                  >
                    <Icon
                      className={cn("mt-0.5 size-5 shrink-0", variantAccent[item.variant])}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      {item.description ? (
                        <p className="mt-0.5 text-sm text-muted">{item.description}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => dismiss(item.id)}
                      aria-label="Cerrar notificación"
                      className="shrink-0 text-muted transition-colors hover:text-foreground"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return context;
}
