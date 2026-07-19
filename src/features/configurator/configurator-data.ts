import type { ProductConfigurator } from "./config-types";

/**
 * Reference configurator for a bioclimatic aluminium pergola.
 * In production this data lives in Prisma (ConfiguratorOption / Value / Rule)
 * and is edited from the admin panel. For Tahap 8 we ship a static preset that
 * demonstrates the rule engine, live pricing, live SKU and live preview.
 */
export const bioclimaticConfigurator: ProductConfigurator = {
  productSlug: "sarasota-14x10",
  basePriceCents: 209000,
  options: [
    {
      code: "width",
      type: "dimension",
      label: "Largeur",
      helper: "De 3,00 m à 6,00 m, au centimètre près.",
      required: true,
      values: [
        {
          code: "w",
          label: "Largeur (mm)",
          priceKind: "per_linear_m",
          priceCents: 24000, // 240€ per additional meter over base
          minMm: 3000,
          maxMm: 6000,
          stepMm: 100,
          defaultMm: 4000,
          isDefault: true,
        },
      ],
    },
    {
      code: "length",
      type: "dimension",
      label: "Longueur",
      helper: "De 3,00 m à 7,00 m, au centimètre près.",
      required: true,
      values: [
        {
          code: "l",
          label: "Longueur (mm)",
          priceKind: "per_linear_m",
          priceCents: 24000,
          minMm: 3000,
          maxMm: 7000,
          stepMm: 100,
          defaultMm: 3000,
          isDefault: true,
        },
      ],
    },
    {
      code: "roof",
      type: "roof",
      label: "Type de toit",
      required: true,
      values: [
        {
          code: "bioclimatique",
          label: "Bioclimatique motorisée",
          priceKind: "flat",
          priceCents: 0,
          isDefault: true,
        },
        {
          code: "vitre-fixe",
          label: "Verre fixe",
          priceKind: "flat",
          priceCents: 180000,
        },
        {
          code: "toile-retractable",
          label: "Toile rétractable",
          priceKind: "flat",
          priceCents: 90000,
        },
      ],
    },
    {
      code: "frame_color",
      type: "frame-color",
      label: "Coloris cadre",
      required: true,
      values: [
        { code: "anthracite", label: "Anthracite RAL 7016", swatch: "#3a3d40", priceKind: "flat", priceCents: 0, isDefault: true },
        { code: "noir-2100", label: "Noir sablé RAL 9005", swatch: "#111111", priceKind: "flat", priceCents: 0 },
        { code: "blanc-9010", label: "Blanc pur RAL 9010", swatch: "#f7f6f2", priceKind: "flat", priceCents: 0 },
        { code: "gris-quartz", label: "Gris quartz RAL 7039", swatch: "#6d6b64", priceKind: "flat", priceCents: 0 },
        { code: "bronze-anodise", label: "Bronze anodisé", swatch: "#5a4630", priceKind: "flat", priceCents: 18000 },
        { code: "cuivre-anodise", label: "Cuivre anodisé", swatch: "#a06846", priceKind: "flat", priceCents: 24000 },
      ],
    },
    {
      code: "roof_color",
      type: "roof-color",
      label: "Coloris lames",
      required: true,
      values: [
        { code: "identique", label: "Identique au cadre", swatch: "#3a3d40", priceKind: "flat", priceCents: 0, isDefault: true },
        { code: "contrast-noir", label: "Contraste noir sablé", swatch: "#111111", priceKind: "flat", priceCents: 12000 },
        { code: "contrast-blanc", label: "Contraste blanc pur", swatch: "#f7f6f2", priceKind: "flat", priceCents: 12000 },
      ],
    },
    {
      code: "led",
      type: "feature",
      label: "Éclairage LED périmétrique",
      helper: "Bandeau LED intégré dans les traverses, dimmable.",
      values: [
        { code: "aucun", label: "Sans", priceKind: "flat", priceCents: 0, isDefault: true },
        { code: "blanc-chaud", label: "Blanc chaud 2700K", priceKind: "flat", priceCents: 49000 },
        { code: "rgbw", label: "RGBW pilotable", priceKind: "flat", priceCents: 78000 },
      ],
    },
    {
      code: "motorisation",
      type: "feature",
      label: "Motorisation & capteurs",
      values: [
        { code: "manuel", label: "Manivelle manuelle", priceKind: "flat", priceCents: 0 },
        { code: "moto-radio", label: "Motorisation radio (télécommande)", priceKind: "flat", priceCents: 45000, isDefault: true },
        { code: "moto-somfy", label: "Somfy io + capteur pluie/vent", priceKind: "flat", priceCents: 78000 },
      ],
    },
    {
      code: "screen",
      type: "accessory",
      label: "Zip screen latéral",
      helper: "Toile screen manuelle ou motorisée, une face.",
      values: [
        { code: "aucun", label: "Sans", priceKind: "flat", priceCents: 0, isDefault: true },
        { code: "manuel-1", label: "Manuel — 1 face", priceKind: "flat", priceCents: 42000 },
        { code: "moto-1", label: "Motorisé — 1 face", priceKind: "flat", priceCents: 68000 },
        { code: "moto-2", label: "Motorisé — 2 faces", priceKind: "flat", priceCents: 128000 },
      ],
    },
    {
      code: "glass",
      type: "accessory",
      label: "Vitrage coulissant",
      helper: "Baie vitrée coulissante sans profil, une face.",
      values: [
        { code: "aucun", label: "Sans", priceKind: "flat", priceCents: 0, isDefault: true },
        { code: "vitre-1", label: "1 face vitrée", priceKind: "flat", priceCents: 149000 },
        { code: "vitre-2", label: "2 faces vitrées", priceKind: "flat", priceCents: 279000 },
      ],
    },
    {
      code: "foundation",
      type: "foundation",
      label: "Préparation du sol",
      values: [
        { code: "existant", label: "Sol dur existant", priceKind: "flat", priceCents: 0, isDefault: true },
        { code: "plots-beton", label: "4 plots béton scellés", priceKind: "flat", priceCents: 62000 },
        { code: "dalle-complete", label: "Dalle béton complète", priceKind: "per_sqm", priceCents: 8500 },
      ],
    },
    {
      code: "installation",
      type: "installation",
      label: "Installation",
      values: [
        { code: "diy", label: "Livraison seule (autonome)", priceKind: "flat", priceCents: 0 },
        { code: "pose-standard", label: "Pose par nos équipes", priceKind: "flat", priceCents: 149000, isDefault: true },
        { code: "pose-premium", label: "Pose premium + finitions maçonnées", priceKind: "flat", priceCents: 249000 },
      ],
    },
  ],
  rules: [
    // Glass requires bioclimatic or fixed glass roof
    { sourceOption: "glass", sourceValue: "vitre-1", targetOption: "roof", targetValue: "toile-retractable", action: "incompatible" },
    { sourceOption: "glass", sourceValue: "vitre-2", targetOption: "roof", targetValue: "toile-retractable", action: "incompatible" },
    // Motorised screen requires powered motorisation (not manual crank)
    { sourceOption: "screen", sourceValue: "moto-1", targetOption: "motorisation", targetValue: "manuel", action: "incompatible" },
    { sourceOption: "screen", sourceValue: "moto-2", targetOption: "motorisation", targetValue: "manuel", action: "incompatible" },
    // Toile rétractable is not compatible with LED integrated in louvres
    { sourceOption: "roof", sourceValue: "toile-retractable", targetOption: "led", targetValue: "blanc-chaud", action: "incompatible" },
    { sourceOption: "roof", sourceValue: "toile-retractable", targetOption: "led", targetValue: "rgbw", action: "incompatible" },
  ],
};
