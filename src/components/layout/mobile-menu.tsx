"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

const groups = [
  {
    title: "Collection",
    items: [
      { label: "Toutes les pergolas", href: "/pergolas" },
      { label: "Gazebos", href: "/gazebos" },
      { label: "Carports", href: "/carports" },
      { label: "Cuisines d'extérieur", href: "/cuisines-exterieur" },
      { label: "Accessoires", href: "/accessoires" },
    ],
  },
  {
    title: "Maison",
    items: [
      { label: "À propos", href: "/a-propos" },
      { label: "Réalisations", href: "/realisations" },
      { label: "Journal", href: "/journal" },
      { label: "Contact & showroom", href: "/contact" },
    ],
  },
  {
    title: "Service",
    items: [
      { label: "Configurateur", href: "/configurateur" },
      { label: "Livraison & pose", href: "/livraison" },
      { label: "Garantie 10 ans", href: "/garantie" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Espace client",
    items: [
      { label: "Se connecter", href: "/connexion" },
      { label: "Créer un compte", href: "/inscription" },
      { label: "Mon compte", href: "/compte" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: Props) {
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
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
            aria-label="Fermer le menu"
            className="hover:bg-muted rounded-full p-2 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-10 p-6">
          {groups.map((g) => (
            <div key={g.title}>
              <Eyebrow>{g.title}</Eyebrow>
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
                        {item.label}
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
              Configurer ma pergola
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
