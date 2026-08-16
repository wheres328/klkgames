import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leadingIcon, trailing, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              {leadingIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-10 w-full rounded-input border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50",
              leadingIcon && "pl-9",
              trailing && "pr-10",
              error && "border-danger/60 focus:border-danger focus:ring-danger/30",
              className,
            )}
            {...props}
          />
          {trailing ? (
            <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>
          ) : null}
        </div>
        {error ? (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
