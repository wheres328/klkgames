import { forwardRef } from "react";
import type { ReactNode } from "react";
import { Button, buttonVariants, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends Omit<ButtonProps, "children"> {
  label: string;
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, children, variant = "ghost", size = "icon", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      aria-label={label}
      className={cn("rounded-input", className)}
      {...props}
    >
      {children}
    </Button>
  ),
);
IconButton.displayName = "IconButton";

export { buttonVariants };
