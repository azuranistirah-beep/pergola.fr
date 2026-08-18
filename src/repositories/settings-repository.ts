import { queryOne, upsertOne, toSqlDate } from "@/lib/db";

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
  whatsappNumber: string;
  whatsappMessage: string;
  // Company legal identity (shown on invoice header)
  companyName: string;
  companyLegalForm: string;
  companyCapital: string;
  companySiret: string;
  companyRcs: string;
  companyVatNumber: string;
  companyAddress: string;
  // Invoicing
  vatRatePercent: number;
  invoicePrefix: string;
  paymentTermsDays: number;
  paymentTerms: string;
  bankName: string;
  bankIban: string;
  bankBic: string;
  invoiceFooter: string;
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
  phone: "+905016479902",
  email: "bonjour@pergolafr.com",
  showroomAddress: "12 rue de Rivoli, 75004 Paris",
  showroomHours: "Mardi–Samedi, 10h–19h",
  instagram: "@pergolafr",
  whatsappNumber: "905016479902",
  whatsappMessage: "Bonjour, je souhaite en savoir plus sur vos pergolas.",
  companyName: "Pergola FR SAS",
  companyLegalForm: "SAS",
  companyCapital: "250 000 €",
  companySiret: "892 456 789 00012",
  companyRcs: "RCS Paris 892 456 789",
  companyVatNumber: "FR 12 892456789",
  companyAddress: "12 rue de Rivoli, 75004 Paris — France",
  vatRatePercent: 20,
  invoicePrefix: "INV",
  paymentTermsDays: 30,
  paymentTerms:
    "Paiement à réception de facture. Aucun escompte pour paiement anticipé.",
  bankName: "",
  bankIban: "",
  bankBic: "",
  invoiceFooter:
    "En cas de retard de paiement, une pénalité de 3× le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 € (art. L.441-10 Code de commerce).",
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
  // If the DB is unreachable (build-time prerender without a MYSQL_URL, or a
  // transient outage in prod), the theme / site chrome should still render.
  // The defaults are good-enough copy — swallow the connection error and log
  // once so operators can spot it in server logs.
  let row: { value: unknown } | null = null;
  try {
    row = await queryOne<{ value: unknown }>(
      "SELECT value FROM site_settings WHERE `key` = ? LIMIT 1",
      [key],
    );
  } catch (err) {
    console.warn(
      `[settings-repository] Falling back to defaults for "${key}":`,
      err instanceof Error ? err.message : err,
    );
    return fallback;
  }
  if (!row?.value) return fallback;
  // mysql2 auto-parses JSON columns into JS objects/values.
  const parsed = row.value as Partial<T>;
  if (typeof fallback === "object" && fallback !== null) {
    return { ...(fallback as object), ...(parsed as object) } as T;
  }
  return parsed as T;
}

export const getTheme = () => get<ThemeSettings>("theme", defaultTheme);
export const getSiteInfo = () => get<SiteInfoSettings>("site", defaultSite);
export const getContent = () => get<ContentSettings>("content", defaultContent);

/** Admin write — INSERT or UPDATE on PRIMARY KEY conflict. */
export async function upsertSetting(key: string, value: unknown) {
  // MySQL's JSON column accepts either a JSON literal string or a native JS
  // value bound as JSON.stringify. We stringify explicitly so complex objects
  // (defaults spread + patch) round-trip without surprises.
  await upsertOne("site_settings", {
    key,
    value: JSON.stringify(value),
    updated_at: toSqlDate(),
  });
}
