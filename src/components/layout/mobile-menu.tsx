"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

const groups = [
  {
    title: "collection",
    items: [
      { labelKey: "allPergolas", href: "/pergolas" },
      { labelKey: "gazebos", href: "/gazebos" },
      { labelKey: "carports", href: "/carports" },
      { labelKey: "kitchens", href: "/cuisines-exterieur" },
      { labelKey: "accessories", href: "/accessoires" },
    ],
  },
  {
    title: "house",
    items: [
      { labelKey: "about", href: "/a-propos" },
      { labelKey: "projects", href: "/realisations" },
      { labelKey: "journal", href: "/journal" },
      { labelKey: "contact", href: "/contact" },
    ],
  },
  {
    title: "service",
    items: [
      { labelKey: "configurator", href: "/configurateur" },
      { labelKey: "shipping", href: "/livraison" },
      { labelKey: "warranty", href: "/garantie" },
      { labelKey: "faq", href: "/faq" },
    ],
  },
  {
    title: "clientArea",
    items: [
      { labelKey: "signIn", href: "/connexion" },
      { labelKey: "signUp", href: "/inscription" },
      { labelKey: "myAccount", href: "/compte" },
      { labelKey: "myWishlist", href: "/wishlist" },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: Props) {
  const t = useTranslations("menu");
  const pathname = usePathname();

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "bg-background fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col overflow-y-auto transition-transform duration-500 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="border-border/60 flex items-center justify-between border-b p-6">
          <Link
            href="/"
            onClick={onClose}
            className="font-serif text-2xl tracking-tight"
          >
            Pergola<span className="text-accent">.</span>fr
          </Link>
          <button
            onClick={onClose}
            className="hover:bg-muted rounded-full p-2 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-10 p-6">
          {groups.map((g) => (
            <div key={g.title}>
              <Eyebrow>{t(g.title)}</Eyebrow>
              <ul className="mt-4 space-y-1">
                {g.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "block rounded-lg py-2 font-serif text-lg transition-colors",
                          active ? "text-accent" : "text-primary hover:text-accent",
                        )}
                      >
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border/60 border-t p-6">
          <Button asChild variant="accent" size="lg" className="w-full">
            <Link href="/configurateur" onClick={onClose}>
              {t("primaryCta")}
            </Link>
          </Button>
          <div className="text-secondary mt-6 space-y-1 text-xs">
            <div>+33 1 84 88 00 00</div>
            <div>bonjour@pergolafr.com</div>
            <div>12 rue de Rivoli, 75004 Paris</div>
          </div>
        </div>
      </div>
    </>
  );
}
