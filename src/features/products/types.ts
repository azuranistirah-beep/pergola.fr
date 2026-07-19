export type ProductFamily =
  | "beaumont"
  | "ashland"
  | "somerville"
  | "delray"
  | "brendan"
  | "sarasota"
  | "evanston"
  | "windham"
  | "tuscany"
  | "verona";

export type ProductMaterial = "wood" | "steel" | "aluminium";

export type ProductCategory =
  | "pergola-bois"
  | "pergola-aluminium"
  | "pergola-lame-orientable"
  | "pergola-adossee"
  | "pergola-cabana";

export interface PergolaProduct {
  slug: string;
  sku: string;
  family: ProductFamily;
  material: ProductMaterial;
  category: ProductCategory;
  name: string;
  tagline: string;
  widthFt: number;
  lengthFt: number;
  widthCm: number;
  lengthCm: number;
  priceCents: number;
  compareAtCents?: number;
  imageCount: number;
  /** Remote placeholder URL — used until user drops local `cover.jpg`. */
  heroUrl?: string;
  featured?: boolean;
  finish?: string;
  colorway: "warm-cedar" | "walnut" | "barnwood" | "black" | "white";
}
