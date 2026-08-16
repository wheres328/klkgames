import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
};

const imageSize = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent/40 to-accent-2/40 font-semibold text-foreground",
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={`Avatar de ${name}`}
          width={imageSize[size]}
          height={imageSize[size]}
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
