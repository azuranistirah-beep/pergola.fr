import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getAdminLocale } from "@/lib/admin-i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pergola FR — Admin",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getAdminLocale();
  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="bg-muted min-h-full font-sans">{children}</body>
    </html>
  );
}
