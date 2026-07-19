import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listProductSlugs } from "@/repositories/product-repository";
import { journalPosts } from "@/features/journal/journal-data";
import { projects } from "@/features/projects/projects-data";

const BASE = "https://pergolafr.com";
const staticPaths = [
  "",
  "/pergolas",
  "/gazebos",
  "/carports",
  "/cuisines-exterieur",
  "/accessoires",
  "/configurateur",
  "/realisations",
  "/a-propos",
  "/journal",
  "/contact",
  "/livraison",
  "/garantie",
  "/faq",
  "/mentions-legales",
  "/confidentialite",
  "/cgv",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const productSlugs = await listProductSlugs().catch(() => []);
  const entries: MetadataRoute.Sitemap = [];

  routing.locales.forEach((locale) => {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    staticPaths.forEach((path) => {
      entries.push({
        url: `${BASE}${prefix}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: path === "" ? 1 : 0.6,
      });
    });
    productSlugs.forEach((slug) => {
      entries.push({
        url: `${BASE}${prefix}/pergolas/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
    journalPosts.forEach((p) => {
      entries.push({
        url: `${BASE}${prefix}/journal/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    });
    projects.forEach((p) => {
      entries.push({
        url: `${BASE}${prefix}/realisations/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  });

  return entries;
}
