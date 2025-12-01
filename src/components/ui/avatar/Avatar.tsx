"use client";
import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

const sizeMap = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
} as const;

export type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  size?: keyof typeof sizeMap;
  className?: string;
};

function getInitials(name?: string) {
  if (!name) return "??";
  const [first = "", second = ""] = name.split(" ");
  return (first[0] ?? "").toUpperCase() + (second[0] ?? "").toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  className,
}) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-black/10 text-[hsl(var(--fg))]",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? name}
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full rounded-full object-cover",
            !loaded && "hidden"
          )}
        />
      ) : null}
      {!src || !loaded ? <span>{getInitials(name)}</span> : null}
    </div>
  );
};
