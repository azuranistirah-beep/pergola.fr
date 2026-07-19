import { Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const reviews = [
  {
    author: "Camille & Antoine L.",
    location: "Saint-Malo (35)",
    avatar: "linear-gradient(140deg, #a17a4b, #5c3e1d)",
    rating: 5,
    date: "12 mars 2026",
    title: "Installation impeccable, esthétique bluffante.",
    body: "La pergola est plus belle qu'à l'écran, l'équipe de pose est arrivée pile à l'heure et a laissé le chantier nickel. Nous en profitons tous les soirs depuis un mois.",
  },
  {
    author: "Hélène R.",
    location: "Bordeaux (33)",
    avatar: "linear-gradient(140deg, #c8a46b, #7d5a2b)",
    rating: 5,
    date: "28 février 2026",
    title: "Un vrai bijou d'artisanat.",
    body: "Les finitions au dixième, les LED intégrées invisibles, l'application Somfy qui pilote tout... rien à redire. Le SAV est également très réactif.",
  },
  {
    author: "Marc D.",
    location: "Nice (06)",
    avatar: "linear-gradient(140deg, #2b2b2b, #6a6a6a)",
    rating: 5,
    date: "10 février 2026",
    title: "Doublé notre capacité de terrasse.",
    body: "Nous sommes restaurant étoilé, nous avons besoin de fiabilité. Un an d'usage intensif et zéro incident. Les couverts en terrasse ont doublé grâce à la pergola.",
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w && !w.includes(".") && !w.includes("&"))
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

export function ProductReviews() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Avis clients vérifiés</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">
              La confiance, ressentie.
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-accent flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>
            <div className="text-primary">
              <span className="font-serif text-2xl">{avg}</span>
              <span className="text-secondary text-sm"> / 5</span>
              <div className="text-secondary text-xs">
                {reviews.length * 47} avis clients
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.author}
              className="border-border/70 rounded-[var(--radius-lg)] border p-8"
            >
              <div className="text-accent flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <h3 className="mt-6 font-serif text-lg leading-snug">{r.title}</h3>
              <blockquote className="text-secondary mt-3 text-sm leading-relaxed">
                « {r.body} »
              </blockquote>
              <figcaption className="border-border/60 mt-6 flex items-center gap-3 border-t pt-5">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full font-serif text-xs text-white"
                  style={{ background: r.avatar }}
                  aria-hidden
                >
                  {initials(r.author)}
                </div>
                <div className="text-xs">
                  <div className="text-primary font-medium">{r.author}</div>
                  <div className="text-secondary">
                    {r.location} · {r.date}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
