/**
 * Central catalogue of the 29 pergola photos we ship with the repo.
 * Everywhere the design needs a real photo (hero, category card, article
 * cover, project cover, …) reference one of these keys instead of hardcoding
 * a URL. If we ever swap the storage provider this stays a one-line edit.
 *
 * Photos live under `public/images/products/<slug>/<file>` and are seeded by
 * `scripts/seed-product-images.mjs`. Deploying via git makes them available
 * on Hostinger without a separate upload step.
 */

const STORAGE_BASE = "/images/products";

export const photoBySlug = (slug: string, file: string = "cover.jpg") =>
  `${STORAGE_BASE}/${slug}/${file}`;

/** Curated photo pointers for editorial surfaces. */
export const editorialPhoto = {
  homeHero: photoBySlug("sarasota-14x10"),
  aboutAtelier: photoBySlug("beaumont-14x12"),
  configuratorTeaser: photoBySlug("sarasota-16x10"),
  showroomCta: photoBySlug("windham-14x12"),
} as const;

export const categoryPhoto: Record<string, string> = {
  bioclimatic: photoBySlug("sarasota-14x10"),
  aluminium: photoBySlug("windham-14x10"),
  wood: photoBySlug("beaumont-14x12"),
  carport: photoBySlug("evanston-14x10"),
  kitchen: photoBySlug("tuscany-corner"),
};

export const journalPhoto: Record<string, string> = {
  "choisir-pergola-bioclimatique": photoBySlug("sarasota-18x10"),
  "cedre-vs-aluminium": photoBySlug("ashland-14x10"),
  "installation-hiver": photoBySlug("beaumont-20x12"),
  "eclairage-led-perimetrique": photoBySlug("sarasota-20x10"),
};

export const projectPhoto: Record<string, string> = {
  "villa-saint-tropez": photoBySlug("sarasota-16x10"),
  "hotel-marais": photoBySlug("evanston-14x10"),
  "restaurant-nice": photoBySlug("sarasota-20x10"),
  "piscine-bordeaux": photoBySlug("windham-14x12"),
  "chalet-megeve": photoBySlug("beaumont-24x12"),
  "commerce-lyon": photoBySlug("evanston-18x10"),
};

/**
 * Pergola slugs grouped by family. Used to source distinct gallery slides
 * for a PDP (slide 1 = self, slides 2-3 = other members of the family).
 */
export const familySlugs: Record<string, string[]> = {
  beaumont: [
    "beaumont-10x10",
    "beaumont-12x10",
    "beaumont-12x12",
    "beaumont-14x10",
    "beaumont-14x12",
    "beaumont-16x12",
    "beaumont-20x12",
    "beaumont-24x12",
  ],
  ashland: ["ashland-14x10"],
  somerville: ["somerville-14x10-barnwood", "somerville-14x10-walnut"],
  delray: ["delray-14x10"],
  brendan: ["brendan-12x10"],
  sarasota: [
    "sarasota-10x10",
    "sarasota-12x10",
    "sarasota-14x10",
    "sarasota-16x10",
    "sarasota-18x10",
    "sarasota-20x10",
  ],
  evanston: [
    "evanston-10x10",
    "evanston-12x10",
    "evanston-14x10",
    "evanston-16x10",
    "evanston-18x10",
    "evanston-20x10",
  ],
  windham: ["windham-14x10", "windham-14x12"],
  tuscany: ["tuscany-corner"],
  verona: ["verona-corner"],
};

// Fallback pool when a family only ships one product — mixes lifestyle shots
// from adjacent families so the gallery still reads as 4 distinct slides.
const lifestylePool = [
  "sarasota-14x10",
  "sarasota-16x10",
  "sarasota-18x10",
  "evanston-14x10",
  "evanston-16x10",
  "windham-14x12",
  "beaumont-14x12",
  "beaumont-16x12",
  "beaumont-20x12",
  "tuscany-corner",
  "verona-corner",
];

/** Return N distinct photo URLs for a PDP gallery. */
export function galleryFor(
  slug: string,
  family: string,
  count = 4,
): string[] {
  const siblings = (familySlugs[family] ?? []).filter((s) => s !== slug);
  const backfill = lifestylePool.filter(
    (s) => s !== slug && !siblings.includes(s),
  );
  const pool = [slug, ...siblings, ...backfill];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of pool) {
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(photoBySlug(s));
    if (out.length >= count) break;
  }
  return out;
}
