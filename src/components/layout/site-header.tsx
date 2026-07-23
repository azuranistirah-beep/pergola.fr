"use client";

import * as React from "react";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { useCart } from "@/features/cart/cart-store";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchDialog } from "@/components/layout/search-dialog";
import { cn } from "@/lib/utils";
import type { PergolaProduct } from "@/features/products/types";
import { Logo } from "@/components/brand/logo";

// Pages whose top section is a dark, full-bleed photo — the header can stay
// transparent until the user scrolls past it. Every other route uses a solid
// header from the first pixel so the nav is never invisible on white.
const darkHeroRoutes = new Set([
  "/",
  "/gazebos",
  "/carports",
  "/cuisines-exterieur",
  "/accessoires",
  "/commande/confirmation",
]);

const navItems = [
  { key: "pergolas", href: "/pergolas" },
  { key: "projects", href: "/realisations" },
  { key: "about", href: "/a-propos" },
  { key: "journal", href: "/journal", label: "Journal" },
  { key: "contact", href: "/contact" },
] as const;

export interface SiteInfoForHeader {
  phone: string;
  email: string;
  showroomAddress: string;
}

export function SiteHeader({
  catalog,
  site,
}: {
  catalog: PergolaProduct[];
  site: SiteInfoForHeader | null;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isDarkHero = darkHeroRoutes.has(pathname);
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { count } = useCart();
  const overPhoto = isDarkHero && !scrolled;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          overPhoto
            ? "bg-transparent"
            : "bg-background/90 border-border/60 border-b backdrop-blur-md",
        )}
      >
        <Container className="flex h-20 items-center justify-between md:h-24">
          <Link
            href="/"
            aria-label="Pergola FR"
            className={cn(
              "transition-colors",
              overPhoto ? "text-white" : "text-primary",
            )}
          >
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "text-[13px] font-medium tracking-wide transition-colors hover:opacity-70",
                  overPhoto ? "text-white" : "text-primary",
                )}
              >
                {"label" in item ? item.label : t(item.key)}
              </Link>
            ))}
          </nav>

          <div
            className={cn(
              "flex items-center gap-1 transition-colors",
              overPhoto ? "text-white" : "text-primary",
            )}
          >
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
              className="hover:bg-foreground/5 rounded-full p-2.5 transition-colors"
            >
              <Search className="size-[18px]" />
            </button>
            <div className="hidden md:block">
              <LanguageSwitcher dark={overPhoto} />
            </div>
            <Link
              href="/panier"
              aria-label="Panier"
              className="hover:bg-foreground/5 relative rounded-full p-2.5 transition-colors"
            >
              <ShoppingBag className="size-[18px]" />
              {count > 0 && (
                <span className="bg-accent text-accent-foreground absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
              className="hover:bg-foreground/5 rounded-full p-2.5 transition-colors lg:hidden"
            >
              <Menu className="size-[18px]" />
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} site={site} />
      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        catalog={catalog}
      />
    </>
  );
}
