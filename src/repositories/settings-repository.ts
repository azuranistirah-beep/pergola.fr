import { insforge } from "@/lib/insforge";
import { insforgeAdmin } from "@/lib/insforge-admin";

export interface ThemeSettings {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  secondary: string;
  radius: number;
}

export interface SiteInfoSettings {
  phone: string;
  email: string;
  showroomAddress: string;
  showroomHours: string;
  instagram: string;
}

export const defaultTheme: ThemeSettings = {
  primary: "#111111",
  accent: "#c8a46b",
  background: "#fafafa",
  foreground: "#111111",
  secondary: "#555555",
  radius: 16,
};

const defaultSite: SiteInfoSettings = {
  phone: "+33 1 84 88 00 00",
  email: "bonjour@pergolafr.com",
  showroomAddress: "12 rue de Rivoli, 75004 Paris",
  showroomHours: "Mardi–Samedi, 10h–19h",
  instagram: "@pergolafr",
};

export interface ContentSettings {
  heroTitleFr: string;
  heroTitleEn: string;
  heroSubtitleFr: string;
  heroSubtitleEn: string;
  heroEyebrowFr: string;
  heroEyebrowEn: string;
}

const defaultContent: ContentSettings = {
  heroTitleFr: "L'art de vivre dehors, redessiné.",
  heroTitleEn: "Outdoor living, redrawn.",
  heroSubtitleFr:
    "Pergolas bioclimatiques, gazebos et structures d'extérieur haut de gamme, dessinées à Paris et fabriquées dans nos ateliers en Vendée.",
  heroSubtitleEn:
    "Bioclimatic pergolas, gazebos and premium outdoor structures — designed in Paris, crafted in our Vendée workshops.",
  heroEyebrowFr: "Collection 2026 — Fabrication française",
  heroEyebrowEn: "2026 Collection — Made in France",
};

async function get<T>(key: string, fallback: T): Promise<T> {
  const { data } = await insforge.database
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .limit(1);
  const first = (data ?? [])[0] as { value: T } | undefined;
  return (first?.value ?? fallback) as T;
}

export const getTheme = () => get<ThemeSettings>("theme", defaultTheme);
export const getSiteInfo = () => get<SiteInfoSettings>("site", defaultSite);
export const getContent = () => get<ContentSettings>("content", defaultContent);

/** Admin write. */
export async function upsertSetting(key: string, value: unknown) {
  const { error } = await insforgeAdmin.database
    .from("site_settings")
    .upsert([{ key, value, updated_at: new Date().toISOString() }]);
  if (error) throw error;
}
