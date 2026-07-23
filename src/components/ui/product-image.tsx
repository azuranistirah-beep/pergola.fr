"use client";

import * as React from "react";
import Image from "next/image";
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
 * image fading in on top when it successfully loads. Uses next/image so the
 * remote source is resized + reformatted (WebP/AVIF) through Next's optimizer,
 * which dramatically cuts payload and avoids connection-storm failures when a
 * listing page requests dozens of full-resolution images at once.
 *
 * On network error (rare, but possible with unreliable storage) we retry once,
 * then fall back to the colorway gradient with a small "Visuel à venir" hint.
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
  const [retryKey, setRetryKey] = React.useState(0);
  const attemptedRetry = React.useRef(false);

  const handleError = React.useCallback(() => {
    if (!attemptedRetry.current) {
      attemptedRetry.current = true;
      window.setTimeout(() => setRetryKey((k) => k + 1), 400);
      return;
    }
    setFailed(true);
  }, []);

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ background: gradientByColorway[colorway] }}
    >
      {!failed && (
        <Image
          key={retryKey}
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      {failed && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-center justify-center p-4 text-[10px] uppercase tracking-[0.3em]",
            colorway === "white" || colorway === "warm-cedar"
              ? "text-primary/40"
              : "text-white/60",
          )}
        >
          Visuel à venir
        </div>
      )}
    </div>
  );
}
