"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
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
  Receipt,
  Settings2,
  UserCircle2,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";

type L = {
  role: string;
  viewSite: string;
  logout: string;
  groups: {
    overview: string;
    catalog: string;
    sales: string;
    customers: string;
    customization: string;
    system: string;
  };
  nav: {
    dashboard: string;
    products: string;
    categories: string;
    media: string;
    orders: string;
    invoices: string;
    reports: string;
    inbox: string;
    newsletter: string;
    content: string;
    theme: string;
    settings: string;
    paymentMethods: string;
    users: string;
    account: string;
  };
};

export function AdminShell({
  children,
  onLogout,
  labels,
  localeToggle,
}: {
  children: React.ReactNode;
  onLogout: () => Promise<void>;
  labels: L;
  localeToggle: React.ReactNode;
}) {
  const pathname = usePathname();
  const groups = [
    {
      title: labels.groups.overview,
      items: [{ href: "/admin", label: labels.nav.dashboard, Icon: LayoutDashboard }],
    },
    {
      title: labels.groups.catalog,
      items: [
        { href: "/admin/products", label: labels.nav.products, Icon: Boxes },
        { href: "/admin/categories", label: labels.nav.categories, Icon: Layers },
        { href: "/admin/media", label: labels.nav.media, Icon: ImageIcon },
      ],
    },
    {
      title: labels.groups.sales,
      items: [
        { href: "/admin/orders", label: labels.nav.orders, Icon: Package },
        { href: "/admin/invoices", label: labels.nav.invoices, Icon: Receipt },
        {
          href: "/admin/payment-methods",
          label: labels.nav.paymentMethods,
          Icon: Wallet,
        },
        { href: "/admin/reports", label: labels.nav.reports, Icon: BarChart3 },
      ],
    },
    {
      title: labels.groups.customers,
      items: [
        { href: "/admin/inbox", label: labels.nav.inbox, Icon: Inbox },
        { href: "/admin/newsletter", label: labels.nav.newsletter, Icon: Mail },
      ],
    },
    {
      title: labels.groups.customization,
      items: [
        { href: "/admin/content", label: labels.nav.content, Icon: FileText },
        { href: "/admin/theme", label: labels.nav.theme, Icon: Palette },
        { href: "/admin/settings", label: labels.nav.settings, Icon: Settings2 },
      ],
    },
    {
      title: labels.groups.system,
      items: [
        { href: "/admin/users", label: labels.nav.users, Icon: Users },
        { href: "/admin/account", label: labels.nav.account, Icon: UserCircle2 },
      ],
    },
  ];
  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <aside className="bg-primary text-primary-foreground sticky top-0 hidden h-screen flex-col md:flex">
        <div className="border-primary-foreground/10 border-b p-6">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-7" />
            <div className="font-serif text-xl tracking-tight">
              Pergola<span className="text-accent">.</span>fr
            </div>
          </div>
          <div className="text-primary-foreground/50 mt-2 text-[10px] uppercase tracking-[0.3em]">
            {labels.role}
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
          {localeToggle}
          <Link
            href="/"
            target="_blank"
            className="text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-2"
          >
            <ExternalLink className="size-3.5" />
            {labels.viewSite}
          </Link>
          <form action={onLogout}>
            <button
              type="submit"
              className="text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-2"
            >
              <LogOut className="size-3.5" />
              {labels.logout}
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
