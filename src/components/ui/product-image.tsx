"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const gradientByColorway: Record<string, string> = {
  "warm-cedar":
    "linear-gradient(155deg, #f5ede0 0%, #d9b48a 45%, #a6753f 100%)",
  walnut: "linear-gradient(155deg, #d9c4ac 0%, #8a5a35 55%, #3d2416 100%)",
  barnwood: "linear-gradient(155deg, #d6ccbf 0%, #8b7c67 55%, #4a3f30 100%)",
  black: "linear-gradient(160deg, #2b2b2b 0%, #1a1a1a 55%, #0e0e0e 100%)",
  white: "linear-gradient(160deg, #ffffff 0%, #eeeae2 55%, #cfc9bd 100%)",
};

export interface ProductImageProps {
  src: string;
  alt: string;
  colorway?: keyof typeof gradientByColorway;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders the colorway gradient as a permanent background, with the actual
 * <img> fading in on top when it successfully loads. When the file is missing
 * (404), the img simply never fades in and the gradient stays visible with a
 * discreet "Visuel à venir" caption. This avoids next/image's inconsistent
 * onError behaviour with Turbopack on missing files.
 */
export function ProductImage({
  src,
  alt,
  colorway = "warm-cedar",
  className,
  sizes,
  priority,
}: ProductImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ background: gradientByColorway[colorway] }}
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      {(failed || !loaded) && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-center justify-center p-4 text-[10px] uppercase tracking-[0.3em] transition-opacity duration-500",
            colorway === "white" || colorway === "warm-cedar"
              ? "text-primary/40"
              : "text-white/60",
            failed ? "opacity-100" : "opacity-60",
          )}
        >
          Visuel à venir
        </div>
      )}
    </div>
  );
}
