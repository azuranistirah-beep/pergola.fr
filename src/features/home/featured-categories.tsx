import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const categories = [
  {
    slug: "pergolas",
    key: "bioclimatic",
    gradient:
      "linear-gradient(135deg, #2a2620 0%, #4d4335 55%, #7a6446 100%)",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    slug: "pergolas-aluminium",
    key: "aluminium",
    gradient:
      "linear-gradient(160deg, #d8d3c8 0%, #b7b0a1 60%, #83786a 100%)",
    span: "",
  },
  {
    slug: "pergolas-bois",
    key: "wood",
    gradient:
      "linear-gradient(150deg, #3b2a1a 0%, #6a4a2c 55%, #a17a4b 100%)",
    span: "",
  },
  {
    slug: "carports",
    key: "carport",
    gradient:
      "linear-gradient(160deg, #1e1e1e 0%, #3a3a3a 60%, #5a5a5a 100%)",
    span: "",
  },
  {
    slug: "cuisines-exterieur",
    key: "kitchen",
    gradient:
      "linear-gradient(140deg, #2b1f16 0%, #58402b 55%, #c8a46b 110%)",
    span: "",
  },
] as const;

export function FeaturedCategories() {
  const t = useTranslations("home.categories");
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
              {t("title")}
            </h2>
          </div>
          <p className="text-secondary max-w-md text-base">{t("subtitle")}</p>
        </div>

        <div className="grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className={`group relative overflow-hidden rounded-[var(--radius-lg)] ${c.span}`}
              style={{ background: c.gradient }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0) 60%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="relative flex h-full flex-col justify-between p-8">
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/70">
                  {t(`${c.key}.tag`)}
                </span>
                <div>
                  <h3 className="font-serif text-2xl leading-tight text-white md:text-3xl">
                    {t(`${c.key}.name`)}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-sm text-white/85">
                    <span>{t("cta")}</span>
                    <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
