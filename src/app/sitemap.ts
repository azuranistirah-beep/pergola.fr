import type { MetadataRoute } from "next";
import { catalog } from "@/features/products/catalog";
import { routing } from "@/i18n/routing";

const BASE = "https://pergolafr.com";
const staticPaths = [
  "",
  "/pergolas",
  "/configurateur",
  "/realisations",
  "/a-propos",
  "/journal",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  routing.locales.forEach((locale) => {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    staticPaths.forEach((path) => {
      entries.push({
        url: `${BASE}${prefix}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    });
    catalog.forEach((p) => {
      entries.push({
        url: `${BASE}${prefix}/pergolas/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  });

  return entries;
}
