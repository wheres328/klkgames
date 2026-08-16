"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ tabs, defaultValue, className }: TabsProps) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);

  return (
    <div className={cn("w-full", className)}>
      <div role="tablist" aria-label="Secciones" className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              role="tab"
              id={`tab-${tab.value}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.value}`}
              onClick={() => setActive(tab.value)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                isActive
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={`panel-${tab.value}`}
          aria-labelledby={`tab-${tab.value}`}
          hidden={tab.value !== active}
          className="pt-6"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
