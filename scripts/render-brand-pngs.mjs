#!/usr/bin/env node
// Rasterise the SVG brand assets to WhatsApp / social-ready PNGs.
//
// Outputs into public/brand/:
//   • pergola-fr-mark-dark-1024.png     — square, dark bg (WhatsApp Business avatar)
//   • pergola-fr-mark-dark-512.png      — same at 512
//   • pergola-fr-mark-transparent-1024.png
//   • pergola-fr-lockup-dark-1200x400.png (header banner)
//
// Every PNG is rendered at the target output size directly (no scaling) so
// there is no blur.

import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const brand = join(__dirname, "..", "public", "brand");

const jobs = [
  { svg: "pergola-fr-mark-light.svg",        out: "pergola-fr-mark-dark-1024.png",        w: 1024, h: 1024, bg: null },
  { svg: "pergola-fr-mark-light.svg",        out: "pergola-fr-mark-dark-512.png",         w: 512,  h: 512,  bg: null },
  { svg: "pergola-fr-mark-transparent.svg",  out: "pergola-fr-mark-transparent-1024.png", w: 1024, h: 1024, bg: null },
  { svg: "pergola-fr-mark-transparent.svg",  out: "pergola-fr-mark-transparent-512.png",  w: 512,  h: 512,  bg: null },
  { svg: "pergola-fr-lockup-light.svg",      out: "pergola-fr-lockup-dark-1200x400.png",  w: 1200, h: 400,  bg: null },
];

for (const j of jobs) {
  const src = await readFile(join(brand, j.svg));
  let pipeline = sharp(src, { density: 300 }).resize(j.w, j.h, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (j.bg) {
    pipeline = pipeline.flatten({ background: j.bg });
  }
  const buf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
  await writeFile(join(brand, j.out), buf);
  console.log(`✓ ${j.out} (${(buf.length / 1024).toFixed(0)} KB)`);
}
