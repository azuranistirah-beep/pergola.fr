import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export function AuthShell({
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const t = useTranslations("auth");
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside
        className="relative hidden overflow-hidden md:block"
        style={{
          background:
            "radial-gradient(80% 60% at 30% 20%, rgba(200,164,107,0.35) 0%, rgba(17,17,17,0) 60%), linear-gradient(180deg, #14100b 0%, #1c1a17 45%, #0f0d0a 100%)",
        }}
      >
        <div className="flex h-full flex-col justify-between p-14 text-white">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Pergola<span className="text-accent">.</span>fr
          </Link>
          <blockquote className="max-w-md">
            <p className="text-accent text-xs uppercase tracking-[0.3em]">
              {t("quote")}
            </p>
            <p className="mt-6 font-serif text-2xl leading-snug text-white">
              {t("quoteText")}
            </p>
          </blockquote>
          <div className="text-xs text-white/50">
            © {new Date().getFullYear()} Pergola FR — {t("madeIn")}
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-background py-24 md:py-0">
        <Container className="max-w-md">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            {title}
          </h1>
          {intro && <p className="text-secondary mt-4 text-sm">{intro}</p>}
          <div className="mt-10">{children}</div>
          {footer && (
            <div className="text-secondary mt-8 text-sm">{footer}</div>
          )}
        </Container>
      </main>
    </div>
  );
}
