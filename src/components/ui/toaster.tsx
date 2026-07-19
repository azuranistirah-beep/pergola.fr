"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      duration={4500}
      toastOptions={{
        classNames: {
          toast:
            "!bg-background !text-primary !border !border-border/60 !rounded-2xl !shadow-[var(--shadow-elevated)] !font-sans",
          title: "!font-medium !text-sm",
          description: "!text-secondary !text-xs",
        },
      }}
    />
  );
}
