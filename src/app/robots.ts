import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/checkout", "/panier"] }],
    sitemap: "https://pergolafr.com/sitemap.xml",
    host: "https://pergolafr.com",
  };
}
