import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata = {
  title: "Réalisations — Nos projets sur-mesure",
  description:
    "Explorez les projets pergolas réalisés dans toute la France : maisons individuelles, hôtels, restaurants, bords de piscine.",
};

const projects = [
  {
    slug: "villa-saint-tropez",
    title: "Villa contemporaine — Saint-Tropez",
    tag: "Résidentiel",
    year: 2025,
    location: "Var (83)",
    gradient: "linear-gradient(150deg, #d8d3c8 0%, #b7b0a1 55%, #83786a 100%)",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    slug: "hotel-marais",
    title: "Hôtel particulier — Le Marais",
    tag: "Hôtellerie",
    year: 2025,
    location: "Paris 4ᵉ",
    gradient: "linear-gradient(155deg, #14100b 0%, #1c1a17 45%, #0f0d0a 100%)",
    span: "",
  },
  {
    slug: "restaurant-nice",
    title: "Le Bord de Mer — Nice",
    tag: "Restaurant",
    year: 2024,
    location: "Alpes-Maritimes (06)",
    gradient: "linear-gradient(145deg, #2b1f16 0%, #58402b 55%, #c8a46b 110%)",
    span: "",
  },
  {
    slug: "piscine-bordeaux",
    title: "Villa piscine — Cap-Ferret",
    tag: "Bord de piscine",
    year: 2024,
    location: "Gironde (33)",
    gradient: "linear-gradient(160deg, #1e3a5f 0%, #4d7ba8 55%, #b8d4e3 100%)",
    span: "md:col-span-2",
  },
  {
    slug: "chalet-megeve",
    title: "Chalet familial — Megève",
    tag: "Résidentiel montagne",
    year: 2024,
    location: "Haute-Savoie (74)",
    gradient: "linear-gradient(150deg, #3b2a1a 0%, #6a4a2c 55%, #a17a4b 100%)",
    span: "",
  },
  {
    slug: "commerce-lyon",
    title: "Terrasse commerciale — Lyon",
    tag: "Commercial",
    year: 2023,
    location: "Rhône (69)",
    gradient: "linear-gradient(160deg, #2b2b2b 0%, #4a4a4a 55%, #7a7a7a 100%)",
    span: "",
  },
] as const;

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <section className="bg-muted pt-32 pb-16 md:pt-40 md:pb-24">
        <Container>
          <Eyebrow>Réalisations</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            Portfolio de nos projets sur-mesure.
          </h1>
          <p className="text-secondary mt-8 max-w-2xl text-base">
            Résidences, hôtels, restaurants, bords de piscine — chaque projet
            est unique, dessiné avec un chef de studio dédié.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid auto-rows-[300px] grid-cols-1 gap-4 md:grid-cols-3">
            {projects.map((p) => (
              <a
                key={p.slug}
                href={`#${p.slug}`}
                className={`group relative overflow-hidden rounded-[var(--radius-lg)] ${p.span}`}
                style={{ background: p.gradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-8 text-white">
                  <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] backdrop-blur">
                    {p.tag}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl leading-tight md:text-3xl">
                      {p.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" /> {p.location}
                      </span>
                      <span>{p.year}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-white/85">
                      <span>Découvrir le projet</span>
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
