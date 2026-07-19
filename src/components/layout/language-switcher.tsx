"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ dark }: { dark?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchTo = (l: string) => {
    router.replace(pathname, { locale: l as "fr" | "en" });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Changer de langue"
        aria-expanded={open}
        className={cn(
          "hover:bg-foreground/5 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors",
          dark ? "text-white" : "text-primary",
        )}
      >
        {locale}
      </button>
      {open && (
        <div className="bg-background border-border/60 absolute right-0 top-full mt-2 min-w-[120px] overflow-hidden rounded-2xl border shadow-[var(--shadow-elevated)]">
          {routing.locales.map((l) => (
            <button
              key={l}
              onClick={() => switchTo(l)}
              className={cn(
                "hover:bg-muted flex w-full items-center justify-between px-4 py-2.5 text-left text-xs",
                l === locale && "text-accent font-medium",
              )}
            >
              <span className="uppercase">{l}</span>
              <span className="text-secondary">
                {l === "fr" ? "Français" : "English"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
