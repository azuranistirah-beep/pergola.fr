#!/usr/bin/env node
// Seed placeholder product photos into public/images/products/<slug>/.
// Sourced from backyarddiscovery.com during development only.
// Replace with in-house photography before launch.

import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "public", "images", "products");

const mapping = {
  "beaumont-10x10": "https://www.backyarddiscovery.com/cdn/shop/files/1505513B-10x10-Pergola-HERO.jpg?v=1742402045&width=1600",
  "beaumont-12x10": "https://www.backyarddiscovery.com/cdn/shop/files/SIZE_12x10_Beaumont-LB_Hero_V1.jpg?v=1773164872&width=1600",
  "beaumont-12x12": "https://www.backyarddiscovery.com/cdn/shop/files/2405028-12x12-Beaumont-Hero.jpg?v=1736198498&width=1600",
  "beaumont-14x10": "https://www.backyarddiscovery.com/cdn/shop/files/14x10-Pergola-B-Main-2.jpg?v=1742401393&width=1600",
  "beaumont-14x12": "https://www.backyarddiscovery.com/cdn/shop/products/P1-14x12BeaumontMaincopy.jpg?v=1643047397&width=1600",
  "beaumont-16x12": "https://www.backyarddiscovery.com/cdn/shop/files/2101562_HERO.jpg?v=1709743189&width=1600",
  "beaumont-20x12": "https://www.backyarddiscovery.com/cdn/shop/files/2101579_HERO.jpg?v=1709743496&width=1600",
  "beaumont-24x12": "https://www.backyarddiscovery.com/cdn/shop/files/2405035-24x12-Beaumont-Hero.jpg?v=1736362093&width=1600",
  "ashland-14x10": "https://www.backyarddiscovery.com/cdn/shop/products/Ashland-Pergola-Maincopy.jpg?v=1660860268&width=1600",
  "somerville-14x10-barnwood": "https://www.backyarddiscovery.com/cdn/shop/products/SomervilleNewElectric.jpg?v=1648042563&width=1600",
  "somerville-14x10-walnut": "https://www.backyarddiscovery.com/cdn/shop/products/Somerville-Main.jpg?v=1624653905&width=1600",
  "delray-14x10": "https://www.backyarddiscovery.com/cdn/shop/products/DelRay_14x10_Pergola_6936b4d9-21b0-4aaa-b8b1-4706a4ea9248.jpg?v=1691510223&width=1600",
  "brendan-12x10": "https://www.backyarddiscovery.com/cdn/shop/files/2305076-HERO.jpg?v=1726074211&width=1600",
  "sarasota-10x10": "https://www.backyarddiscovery.com/cdn/shop/files/SIZE_10x10_SarasotaPergola_Hero_v1.jpg?v=1758054317&width=1600",
  "sarasota-12x10": "https://www.backyarddiscovery.com/cdn/shop/files/2407046-HERO-02.jpg?v=1720559867&width=1600",
  "sarasota-14x10": "https://www.backyarddiscovery.com/cdn/shop/files/backyard-discovery-hero-1-open-roof_be55bc11-c969-444f-94f9-d02f0d3c93d7.jpg?v=1705419092&width=1600",
  "sarasota-16x10": "https://www.backyarddiscovery.com/cdn/shop/files/2305113-SARASOTA16X10-HERO-OPEN.jpg?v=1709312773&width=1600",
  "sarasota-18x10": "https://www.backyarddiscovery.com/cdn/shop/files/2407145B-18x10-Sarasota-Hero.jpg?v=1734718303&width=1600",
  "sarasota-20x10": "https://www.backyarddiscovery.com/cdn/shop/files/2305120-HERO-01.jpg?v=1719248981&width=1600",
  "evanston-10x10": "https://www.backyarddiscovery.com/cdn/shop/files/10x10_Evanston__Pergola_Hero_V2.jpg?v=1753904398&width=1600",
  "evanston-12x10": "https://www.backyarddiscovery.com/cdn/shop/files/12x10_Evanston_Pergola_Hero_V2.jpg?v=1753907676&width=1600",
  "evanston-14x10": "https://www.backyarddiscovery.com/cdn/shop/files/14x10_Evanston_Pergola_Hero_V2.jpg?v=1753907868&width=1600",
  "evanston-16x10": "https://www.backyarddiscovery.com/cdn/shop/files/16x10_Evanston_Pergola_Hero_V2.jpg?v=1753908049&width=1600",
  "evanston-18x10": "https://www.backyarddiscovery.com/cdn/shop/files/18x10_Evanston_Pergola_Hero_V2.jpg?v=1753908197&width=1600",
  "evanston-20x10": "https://www.backyarddiscovery.com/cdn/shop/files/20x10_Evanston_Pergola_Hero_V2.jpg?v=1753908351&width=1600",
  "windham-14x10": "https://www.backyarddiscovery.com/cdn/shop/products/ModernPergolaMediumWhite.jpg?v=1651772226&width=1600",
  "windham-14x12": "https://www.backyarddiscovery.com/cdn/shop/files/2105522_HERO.jpg?v=1742845381&width=1600",
  "tuscany-corner": "https://www.backyarddiscovery.com/cdn/shop/products/TuscanyBambooIndigo2.jpg?v=1649268747&width=1600",
  "verona-corner": "https://www.backyarddiscovery.com/cdn/shop/products/VeronaMainBamboo.jpg?v=1649269222&width=1600",
};

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  let ok = 0;
  let skip = 0;
  let fail = 0;
  for (const [slug, url] of Object.entries(mapping)) {
    const dir = join(root, slug);
    await mkdir(dir, { recursive: true });
    const cover = join(dir, "cover.jpg");
    if (await exists(cover)) {
      skip++;
      continue;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(cover, buf);
      // Duplicate for gallery slots — replace with distinct photos later.
      await writeFile(join(dir, "1.jpg"), buf);
      await writeFile(join(dir, "2.jpg"), buf);
      await writeFile(join(dir, "3.jpg"), buf);
      ok++;
      console.log(`OK   ${slug} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      fail++;
      console.error(`FAIL ${slug}: ${err.message}`);
    }
  }
  console.log(`\nDone. ${ok} downloaded, ${skip} skipped, ${fail} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
