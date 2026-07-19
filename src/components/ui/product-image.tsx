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
  fill?: boolean;
  width?: number;
  height?: number;
}

export function ProductImage({
  src,
  alt,
  colorway = "warm-cedar",
  className,
  sizes,
  priority,
  fill = true,
  width,
  height,
}: ProductImageProps) {
  const [errored, setErrored] = React.useState(false);

  if (errored) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("relative h-full w-full", className)}
        style={{ background: gradientByColorway[colorway] }}
      >
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 text-[10px] uppercase tracking-[0.3em] text-white/70">
          Visuel à venir
        </div>
      </div>
    );
  }

  const commonProps = {
    src,
    alt,
    onError: () => setErrored(true),
    priority,
    sizes,
    className: cn("object-cover", className),
  } as const;

  if (fill) return <Image {...commonProps} fill />;
  return <Image {...commonProps} width={width ?? 800} height={height ?? 800} />;
}
