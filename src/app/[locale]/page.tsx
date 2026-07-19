import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="mx-auto flex min-h-screen max-w-container flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-accent text-sm font-medium uppercase tracking-[0.2em]">
        Pergola FR
      </p>
      <h1 className="font-serif text-5xl leading-tight md:text-7xl">
        {t("heroTitle")}
      </h1>
      <p className="text-secondary max-w-xl text-lg">{t("heroSubtitle")}</p>
      <p className="text-secondary mt-8 text-xs">
        Scaffold Tahap 2 — Home réel construit en Tahap 6.
      </p>
    </main>
  );
}
