import * as React from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-accent inline-block text-[11px] font-medium uppercase tracking-[0.3em]",
        className,
      )}
      {...props}
    />
  );
}
