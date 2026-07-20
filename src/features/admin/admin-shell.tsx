"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Palette,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    title: "Vue d'ensemble",
    items: [{ href: "/admin", label: "Dashboard", Icon: LayoutDashboard }],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Produits", Icon: Boxes },
      { href: "/admin/categories", label: "Catégories", Icon: Layers },
      { href: "/admin/media", label: "Médiathèque", Icon: ImageIcon },
    ],
  },
  {
    title: "Ventes",
    items: [{ href: "/admin/orders", label: "Commandes", Icon: Package }],
  },
  {
    title: "Relation client",
    items: [
      { href: "/admin/inbox", label: "Messages", Icon: Inbox },
      { href: "/admin/newsletter", label: "Newsletter", Icon: Mail },
    ],
  },
  {
    title: "Personnalisation",
    items: [
      { href: "/admin/content", label: "Contenu", Icon: FileText },
      { href: "/admin/theme", label: "Thème", Icon: Palette },
      { href: "/admin/settings", label: "Paramètres", Icon: Settings2 },
    ],
  },
] as const;

export function AdminShell({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout: () => Promise<void>;
}) {
  const pathname = usePathname();
  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="bg-primary text-primary-foreground sticky top-0 hidden h-screen flex-col md:flex">
        <div className="border-primary-foreground/10 border-b p-6">
          <div className="font-serif text-xl">
            Pergola<span className="text-accent">.</span>fr
          </div>
          <div className="text-primary-foreground/50 mt-1 text-[10px] uppercase tracking-[0.3em]">
            Administrateur
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-6">
            {groups.map((g) => (
              <li key={g.title}>
                <div className="text-primary-foreground/40 mb-2 px-4 text-[10px] uppercase tracking-[0.3em]">
                  {g.title}
                </div>
                <ul className="space-y-1">
                  {g.items.map((n) => {
                    const active =
                      n.href === "/admin"
                        ? pathname === n.href
                        : pathname === n.href ||
                          pathname.startsWith(n.href + "/");
                    return (
                      <li key={n.href}>
                        <Link
                          href={n.href}
                          className={cn(
                            "flex items-center gap-3 rounded-full px-4 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary-foreground/10 text-primary-foreground"
                              : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground",
                          )}
                        >
                          <n.Icon className="size-4" />
                          {n.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-primary-foreground/10 space-y-3 border-t p-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-2"
          >
            <ExternalLink className="size-3.5" />
            Voir le site
          </Link>
          <form action={onLogout}>
            <button
              type="submit"
              className="text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-2"
            >
              <LogOut className="size-3.5" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0">{children}</main>
    </div>
  );
}
