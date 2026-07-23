import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsappFab } from "@/components/layout/whatsapp-fab";
import { CartProvider } from "@/features/cart/cart-store";
import { listProducts } from "@/repositories/product-repository";
import { getTheme, getSiteInfo } from "@/repositories/settings-repository";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL("https://pergolafr.com"),
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
    },
    title: {
      default: t("defaultTitle"),
      template: `%s — ${t("siteName")}`,
    },
    description: t("defaultDescription"),
    openGraph: {
      type: "website",
      locale,
      siteName: t("siteName"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [catalog, theme, site] = await Promise.all([
    listProducts().catch(() => []),
    getTheme().catch(() => null),
    getSiteInfo().catch(() => null),
  ]);
  const themeCss = theme
    ? `:root{--color-primary:${theme.primary};--color-primary-foreground:${theme.background};--color-accent:${theme.accent};--color-background:${theme.background};--color-foreground:${theme.foreground};--color-secondary:${theme.secondary};--radius:${theme.radius}px;}`
    : "";

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        {themeCss && (
          <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        )}
      </head>
      <body className="bg-background text-foreground min-h-full font-sans">
        <NextIntlClientProvider>
          <CartProvider>
            <SiteHeader catalog={catalog} site={site} />
            <main>{children}</main>
            <SiteFooter />
            <WhatsappFab />
            <Toaster />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
