"use client";

import * as React from "react";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { useCart } from "@/features/cart/cart-store";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "pergolas", href: "/pergolas" },
  { key: "projects", href: "/realisations" },
  { key: "about", href: "/a-propos" },
  { key: "journal", href: "/journal", label: "Journal" },
  { key: "contact", href: "/contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = React.useState(false);
  const { count } = useCart();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/90 border-border/60 border-b backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <Container className="flex h-20 items-center justify-between md:h-24">
        <Link
          href="/"
          className={cn(
            "font-serif text-2xl tracking-tight transition-colors",
            scrolled ? "text-primary" : "text-white",
          )}
        >
          Pergola<span className="text-accent">.</span>fr
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "text-[13px] font-medium tracking-wide transition-colors hover:opacity-70",
                scrolled ? "text-primary" : "text-white",
              )}
            >
              {"label" in item ? item.label : t(item.key)}
            </Link>
          ))}
        </nav>

        <div
          className={cn(
            "flex items-center gap-1 transition-colors",
            scrolled ? "text-primary" : "text-white",
          )}
        >
          <button
            aria-label="Search"
            className="hover:bg-foreground/5 rounded-full p-2.5 transition-colors"
          >
            <Search className="size-[18px]" />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hover:bg-foreground/5 hidden rounded-full p-2.5 transition-colors md:block"
          >
            <Heart className="size-[18px]" />
          </Link>
          <Link
            href="/connexion"
            aria-label="Compte"
            className="hover:bg-foreground/5 hidden rounded-full p-2.5 transition-colors md:block"
          >
            <User className="size-[18px]" />
          </Link>
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
            aria-label="Menu"
            className="hover:bg-foreground/5 rounded-full p-2.5 transition-colors lg:hidden"
          >
            <Menu className="size-[18px]" />
          </button>
        </div>
      </Container>
    </header>
  );
}
