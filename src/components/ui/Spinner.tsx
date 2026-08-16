import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-muted", className)}>
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-accent")} aria-hidden />
      {label ? <span className="text-sm">{label}</span> : null}
    </span>
  );
}
