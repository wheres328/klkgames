import { cn } from "@/lib/utils";

export interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <hr className={cn("border-border", className)} />;
}
