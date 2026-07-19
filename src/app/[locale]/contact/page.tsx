import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ContactForm } from "@/features/contact/contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return { title: t("title"), description: t("intro") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  return (
    <div className="pt-28 pb-24 md:pt-32">
      <Container>
        <div className="grid gap-16 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">
              {t("title")}
            </h1>
            <p className="text-secondary mt-6 max-w-lg text-base">
              {t("intro")}
            </p>

            <ContactForm />
          </div>

          <aside className="space-y-6">
            <InfoCard
              Icon={MapPin}
              title={t("showroom")}
              lines={[
                "12 rue de Rivoli",
                "75004 Paris — Le Marais",
                t("openHours"),
              ]}
            />
            <InfoCard
              Icon={Phone}
              title={t("hotline")}
              lines={["+33 1 84 88 00 00", t("hotlineHours")]}
            />
            <InfoCard
              Icon={Mail}
              title={t("email")}
              lines={["bonjour@pergolafr.com"]}
            />
            <InfoCard
              Icon={MessageCircle}
              title={t("whatsapp")}
              lines={["+33 6 12 34 56 78 — " + t("whatsappHelper")]}
            />
          </aside>
        </div>

        <div className="mt-16 aspect-[16/6] w-full overflow-hidden rounded-[var(--radius-lg)]">
          <iframe
            title="Showroom"
            src="https://www.openstreetmap.org/export/embed.html?bbox=2.3552%2C48.8546%2C2.3620%2C48.8582&layer=mapnik&marker=48.8564%2C2.3586"
            className="h-full w-full grayscale-[0.4]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Container>
    </div>
  );
}

function InfoCard({
  Icon,
  title,
  lines,
}: {
  Icon: typeof Mail;
  title: string;
  lines: string[];
}) {
  return (
    <div className="border-border rounded-[var(--radius-lg)] border p-6">
      <div className="text-accent">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-serif text-lg">{title}</h3>
      <div className="text-secondary mt-3 space-y-1 text-sm">
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
}
