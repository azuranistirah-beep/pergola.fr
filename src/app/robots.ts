import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/checkout",
          "/panier",
          "/commande/",
          "/compte",
          "/wishlist",
          "/connexion",
          "/inscription",
        ],
      },
    ],
    sitemap: "https://pergolafr.com/sitemap.xml",
    host: "https://pergolafr.com",
  };
}
