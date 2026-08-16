"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";
import type { SearchSuggestion } from "@/types/search";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  className?: string;
}

export function SearchInput({
  placeholder = "Buscar juegos, géneros, artículos...",
  suggestions = [],
  className,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const normalized = query.trim().toLowerCase();
  const visible = suggestions.filter(
    (s) =>
      !normalized ||
      s.label.toLowerCase().includes(normalized) ||
      (s.description ?? "").toLowerCase().includes(normalized),
  );
  const showList = open && visible.length > 0;

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowDown" && showList) {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % visible.length);
    } else if (event.key === "ArrowUp" && showList) {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + visible.length) % visible.length);
    } else if (event.key === "Enter" && activeIndex >= 0 && showList) {
      event.preventDefault();
      window.location.href = visible[activeIndex].href;
    }
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(close, 120)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Buscar"
          aria-expanded={showList}
          aria-controls="search-results"
          role="combobox"
          className="h-10 w-full rounded-pill border border-border bg-surface/70 pr-9 pl-10 text-sm text-foreground placeholder:text-muted/70 backdrop-blur transition-colors focus:border-accent/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {query ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
            }}
            className="absolute inset-y-0 right-2.5 my-auto flex size-5 items-center justify-center rounded-input text-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {showList ? (
        <ul
          id="search-results"
          role="listbox"
          className="absolute inset-x-0 top-11 z-50 max-h-96 overflow-auto rounded-card border border-border bg-surface p-1.5 shadow-2xl shadow-black/40"
        >
          {visible.slice(0, 8).map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === activeIndex}>
              <a
                href={item.href}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex items-center gap-3 rounded-input px-2.5 py-2 transition-colors",
                  index === activeIndex ? "bg-surface-raised" : "hover:bg-surface-raised",
                )}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 shrink-0 rounded-input object-cover"
                  />
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-accent/15 text-xs font-bold uppercase text-accent-2">
                    {item.category.slice(0, 2)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className="block truncate text-xs text-muted">{item.description}</span>
                  ) : null}
                </span>
                <span className="shrink-0 rounded-pill bg-surface-raised px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {item.category}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
