#!/usr/bin/env node
// One-shot: regenerate favicon assets from the Pergola FR brand mark.
//
//   src/app/favicon.ico       → multi-resolution ICO (16/32/48/64/128/256)
//   src/app/icon.png          → 512×512 PNG for modern browsers
//   src/app/apple-icon.png    → 180×180 PNG for iOS home-screen
//
// Uses the `sharp` install that ships with Next.js — no extra deps.
// Run with: node scripts/generate-favicons.mjs

import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SOURCE = resolve(root, "public/brand/pergola-fr-mark-dark-1024.png");
const ICO_OUT = resolve(root, "src/app/favicon.ico");
const ICON_OUT = resolve(root, "src/app/icon.png");
const APPLE_OUT = resolve(root, "src/app/apple-icon.png");

// -----------------------------------------------------------------------------
// ICO writer — pure buffer packing so we avoid a native ICO dep.
// Layout: ICONDIR (6b) + n × ICONDIRENTRY (16b each) + n × PNG payloads.
// -----------------------------------------------------------------------------

function packIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);       // reserved
  header.writeUInt16LE(1, 2);       // type = 1 (icon)
  header.writeUInt16LE(count, 4);   // image count

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  pngBuffers.forEach((buf, i) => {
    const size = sizes[i];
    const p = i * 16;
    // 0 in width/height byte means 256 px (max representable)
    dir.writeUInt8(size >= 256 ? 0 : size, p + 0);
    dir.writeUInt8(size >= 256 ? 0 : size, p + 1);
    dir.writeUInt8(0, p + 2);       // palette count (0 = no palette)
    dir.writeUInt8(0, p + 3);       // reserved
    dir.writeUInt16LE(1, p + 4);    // color planes
    dir.writeUInt16LE(32, p + 6);   // bits per pixel
    dir.writeUInt32LE(buf.length, p + 8);
    dir.writeUInt32LE(offset, p + 12);
    offset += buf.length;
  });

  return Buffer.concat([header, dir, ...pngBuffers]);
}

async function main() {
  // Kernel-sharp resampling gives crisp edges on small favicon sizes; the
  // brand mark's chunky slats survive down to 16px reasonably well.
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(SOURCE)
        .resize(size, size, { kernel: sharp.kernel.lanczos3, fit: "contain" })
        .png({ compressionLevel: 9 })
        .toBuffer(),
    ),
  );

  await mkdir(dirname(ICO_OUT), { recursive: true });
  await writeFile(ICO_OUT, packIco(pngs, sizes));
  console.log(`✓ ${ICO_OUT} (${(await import("node:fs")).statSync(ICO_OUT).size} bytes, ${sizes.length} sizes)`);

  // Next.js reads src/app/icon.png at build time and emits it as the modern
  // favicon; providing 512² leaves room for browsers to pick the DPI they need.
  const icon = await sharp(SOURCE).resize(512, 512).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(ICON_OUT, icon);
  console.log(`✓ ${ICON_OUT} (${icon.length} bytes)`);

  // iOS home-screen icons are 180² by Apple's current guidance.
  const apple = await sharp(SOURCE).resize(180, 180).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(APPLE_OUT, apple);
  console.log(`✓ ${APPLE_OUT} (${apple.length} bytes)`);
}

await main();
