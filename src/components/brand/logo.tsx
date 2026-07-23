import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Pergola FR brand mark — abstract front elevation:
 *   • 3 stacked horizontal slats (louvered pergola roof)
 *   • 2 vertical posts anchored on a shadow ground line
 *   • single gold accent dot in the top-right corner (brand signature)
 *
 * Uses `currentColor` for the strokes so it adapts to dark / light contexts;
 * the accent dot pulls from CSS var `--color-accent` and falls back to
 * `#c8a46b` (Pergola FR gold) when the theme isn't loaded (e.g. inside an
 * invoice PDF or a printed page).
 */
export function LogoMark({
  className,
  title = "Pergola FR",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      <title>{title}</title>
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Slats — top louvered roof, thicker at the base to read as an entablature */}
        <line x1="5" y1="6" x2="23" y2="6" strokeWidth="1.3" />
        <line x1="7" y1="9" x2="25" y2="9" strokeWidth="1.3" />
        <line x1="5" y1="12" x2="23" y2="12" strokeWidth="2" />
        {/* Posts */}
        <line x1="7" y1="13" x2="7" y2="27" strokeWidth="2" />
        <line x1="23" y1="13" x2="23" y2="27" strokeWidth="2" />
        {/* Ground line */}
        <line x1="4" y1="27" x2="26" y2="27" strokeWidth="1" opacity="0.7" />
      </g>
      {/* Gold accent — Pergola FR signature */}
      <circle
        cx="27.5"
        cy="4.5"
        r="1.9"
        fill="var(--color-accent, #c8a46b)"
      />
    </svg>
  );
}

/**
 * Full brand lockup: mark + wordmark. Two variants control alignment/spacing.
 *   - `inline`: mark and word on a single row (default, used in headers).
 *   - `stacked`: mark on top, wordmark below (used on invoice header).
 */
export function Logo({
  className,
  wordClassName,
  variant = "inline",
  showTagline = false,
  wordmarkTag: WordmarkTag = "span",
}: {
  className?: string;
  wordClassName?: string;
  variant?: "inline" | "stacked";
  showTagline?: boolean;
  wordmarkTag?: keyof React.JSX.IntrinsicElements;
}) {
  const isStacked = variant === "stacked";
  return (
    <span
      className={cn(
        "inline-flex select-none items-center",
        isStacked ? "flex-col gap-2" : "gap-2.5",
        className,
      )}
    >
      <LogoMark
        className={cn(
          isStacked ? "size-10" : "size-7 md:size-8",
        )}
      />
      <span className={cn("inline-flex flex-col leading-none")}>
        <WordmarkTag
          className={cn(
            "font-serif tracking-tight",
            isStacked ? "text-2xl" : "text-xl md:text-2xl",
            wordClassName,
          )}
        >
          Pergola<span className="text-accent">.</span>fr
        </WordmarkTag>
        {showTagline && (
          <span className="text-secondary mt-1 text-[9px] uppercase tracking-[0.4em]">
            Paris — Made in France
          </span>
        )}
      </span>
    </span>
  );
}
