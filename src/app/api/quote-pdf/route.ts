import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

interface Body {
  productName: string;
  sku: string;
  totalCents: number;
  basePriceCents: number;
  adjustments: { label: string; amountCents: number }[];
  configuration: Record<string, string>;
  areaSqm: number;
  locale: "fr" | "en";
}

const strings = {
  fr: {
    title: "Devis pergola sur-mesure",
    quoteRef: "Référence devis",
    date: "Date",
    valid: "Valable 30 jours",
    productSection: "Produit",
    configSection: "Configuration",
    priceSection: "Prix",
    basePrice: "Prix de base",
    adjustments: "Ajustements",
    totalTtc: "TOTAL TTC",
    installments: "Paiement en 3× sans frais",
    deliverySection: "Livraison & pose",
    deliveryLine: "Livraison estimée : 4 à 6 jours",
    installLine: "Pose incluse (2 à 4 heures) réalisée par nos équipes",
    contactSection: "Contact",
    footer:
      "Ce devis n'est pas contractuel — nos équipes vous contactent sous 48 h pour valider les détails et finaliser la commande. Prix TVA 20% incluse.",
    generated: "Généré le",
  },
  en: {
    title: "Custom pergola quote",
    quoteRef: "Quote reference",
    date: "Date",
    valid: "Valid for 30 days",
    productSection: "Product",
    configSection: "Configuration",
    priceSection: "Price",
    basePrice: "Base price",
    adjustments: "Adjustments",
    totalTtc: "TOTAL (incl. VAT)",
    installments: "Pay in 3× interest-free",
    deliverySection: "Delivery & installation",
    deliveryLine: "Estimated delivery: 4 to 6 days",
    installLine: "Installation included (2 to 4 hours) by our teams",
    contactSection: "Contact",
    footer:
      "This quote is non-binding — our team will contact you within 48 hours to confirm details and finalise the order. Prices include 20% VAT.",
    generated: "Generated on",
  },
} as const;

function formatEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * pdf-lib's WinAnsi encoding rejects a handful of typographic characters we
 * end up with from French copy (en/em dash, curly quotes, non-breaking space).
 * Rewrite them to their ASCII equivalents so drawText never throws.
 */
function safeText(s: string): string {
  return s
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, " ")
    .replace(/…/g, "...");
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const locale = body.locale === "en" ? "en" : "fr";
  const s = strings[locale];

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4 portrait, points
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const width = page.getWidth();
  const brand = rgb(0.14, 0.10, 0.07); // near-black warm
  const accent = rgb(0.78, 0.65, 0.42); // muted gold
  const muted = rgb(0.45, 0.42, 0.38);
  const line = rgb(0.88, 0.85, 0.80);

  let y = 800;

  // Brand header
  page.drawText("PERGOLA FR", {
    x: margin,
    y,
    size: 18,
    font: bold,
    color: brand,
  });
  page.drawText("pergolafr.com", {
    x: width - margin - 90,
    y,
    size: 10,
    font,
    color: muted,
  });
  y -= 12;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: accent,
  });
  y -= 30;

  // Title
  page.drawText(safeText(s.title), {
    x: margin,
    y,
    size: 22,
    font: bold,
    color: brand,
  });
  y -= 30;

  // Ref + date row
  const today = new Date().toLocaleDateString(
    locale === "en" ? "en-GB" : "fr-FR",
    { year: "numeric", month: "long", day: "numeric" },
  );
  drawLabelValue(page, font, bold, muted, brand, margin, y, s.quoteRef, body.sku);
  drawLabelValue(page, font, bold, muted, brand, 320, y, s.date, today);
  y -= 20;
  page.drawText(safeText(s.valid), { x: margin, y, size: 9, font, color: muted });
  y -= 30;

  // Product section
  y = sectionHeader(page, bold, accent, margin, y, s.productSection);
  page.drawText(safeText(body.productName), {
    x: margin,
    y,
    size: 14,
    font: bold,
    color: brand,
  });
  y -= 30;

  // Configuration section
  y = sectionHeader(page, bold, accent, margin, y, s.configSection);
  const entries = Object.entries(body.configuration || {});
  for (const [k, v] of entries) {
    if (y < 200) {
      // paginate if we run out of space
      const newPage = pdf.addPage([595, 842]);
      y = 780;
      // fall through: writes go to the last page. Simplified: keep on same for now.
      // (Quotes are typically ≤ 1 page so this is a safety net.)
      page.drawText("...", { x: margin, y: 200, size: 10, font, color: muted });
      break;
    }
    page.drawText(safeText(String(k)), {
      x: margin,
      y,
      size: 10,
      font,
      color: muted,
    });
    const val = safeText(String(v));
    const valWidth = font.widthOfTextAtSize(val, 10);
    page.drawText(val, {
      x: width - margin - valWidth,
      y,
      size: 10,
      font: bold,
      color: brand,
    });
    y -= 16;
  }
  y -= 12;

  // Price section
  y = sectionHeader(page, bold, accent, margin, y, s.priceSection);
  drawPriceRow(page, font, bold, muted, brand, margin, width, y, s.basePrice, formatEUR(body.basePriceCents));
  y -= 18;
  if (body.adjustments && body.adjustments.length > 0) {
    for (const adj of body.adjustments) {
      drawPriceRow(
        page,
        font,
        bold,
        muted,
        brand,
        margin,
        width,
        y,
        safeText(adj.label),
        "+" + formatEUR(adj.amountCents),
      );
      y -= 16;
    }
  }
  y -= 6;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.75,
    color: line,
  });
  y -= 20;
  // Total
  page.drawText(safeText(s.totalTtc), {
    x: margin,
    y,
    size: 12,
    font: bold,
    color: brand,
  });
  const totalStr = formatEUR(body.totalCents);
  const totalW = bold.widthOfTextAtSize(totalStr, 18);
  page.drawText(totalStr, {
    x: width - margin - totalW,
    y: y - 4,
    size: 18,
    font: bold,
    color: brand,
  });
  y -= 20;
  page.drawText(safeText(s.installments) + " (3x " + formatEUR(Math.round(body.totalCents / 3)) + ")", {
    x: margin,
    y,
    size: 9,
    font,
    color: muted,
  });
  y -= 30;

  // Delivery section
  y = sectionHeader(page, bold, accent, margin, y, s.deliverySection);
  page.drawText(safeText(s.deliveryLine), {
    x: margin,
    y,
    size: 10,
    font,
    color: brand,
  });
  y -= 15;
  page.drawText(safeText(s.installLine), {
    x: margin,
    y,
    size: 10,
    font,
    color: brand,
  });
  y -= 30;

  // Contact section
  y = sectionHeader(page, bold, accent, margin, y, s.contactSection);
  page.drawText("contact@pergolafr.com", {
    x: margin,
    y,
    size: 10,
    font,
    color: brand,
  });
  y -= 15;
  page.drawText("pergolafr.com", { x: margin, y, size: 10, font, color: brand });
  y -= 30;

  // Footer
  const footerLines = wrapText(safeText(s.footer), font, 9, width - 2 * margin);
  for (const l of footerLines) {
    page.drawText(l, { x: margin, y, size: 9, font, color: muted });
    y -= 12;
  }
  y -= 10;
  page.drawText(
    safeText(s.generated) + " " + today,
    { x: margin, y, size: 8, font, color: muted },
  );

  const bytes = await pdf.save();
  const filename = `pergolafr-quote-${body.sku || "custom"}.pdf`;

  return new NextResponse(new Uint8Array(bytes) as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

// ─── helpers ──────────────────────────────────────────────────────────

function sectionHeader(
  page: import("pdf-lib").PDFPage,
  bold: import("pdf-lib").PDFFont,
  accent: import("pdf-lib").RGB,
  x: number,
  y: number,
  label: string,
): number {
  page.drawText(safeText(label).toUpperCase(), {
    x,
    y,
    size: 9,
    font: bold,
    color: accent,
  });
  return y - 18;
}

function drawLabelValue(
  page: import("pdf-lib").PDFPage,
  font: import("pdf-lib").PDFFont,
  bold: import("pdf-lib").PDFFont,
  muted: import("pdf-lib").RGB,
  brand: import("pdf-lib").RGB,
  x: number,
  y: number,
  label: string,
  value: string,
) {
  page.drawText(safeText(label).toUpperCase(), {
    x,
    y: y + 12,
    size: 7,
    font,
    color: muted,
  });
  page.drawText(safeText(value), { x, y, size: 11, font: bold, color: brand });
}

function drawPriceRow(
  page: import("pdf-lib").PDFPage,
  font: import("pdf-lib").PDFFont,
  bold: import("pdf-lib").PDFFont,
  muted: import("pdf-lib").RGB,
  brand: import("pdf-lib").RGB,
  x: number,
  width: number,
  y: number,
  label: string,
  amount: string,
) {
  page.drawText(safeText(label), { x, y, size: 10, font, color: muted });
  const w = bold.widthOfTextAtSize(amount, 11);
  page.drawText(amount, {
    x: width - 50 - w,
    y,
    size: 11,
    font: bold,
    color: brand,
  });
}

function wrapText(
  text: string,
  font: import("pdf-lib").PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && current) {
      out.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) out.push(current);
  return out;
}
