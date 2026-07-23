import { readFileSync } from "node:fs";
import { createAdminClient } from "@insforge/sdk";

for (const file of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const client = createAdminClient({
  baseUrl: process.env.INSFORGE_URL,
  apiKey: process.env.INSFORGE_API_KEY,
});

const methods = [
  {
    kind: "BANK",
    label: "BNP Paribas — Compte principal",
    holder: "Jean Dupont",
    bank_name: "BNP Paribas",
    iban: "FR76 3000 4000 0112 3456 7890 187",
    bic: "BNPAFRPP",
    notes: "Compte de test — pour vérification du parcours d'achat uniquement.",
    is_default: true,
    is_active: true,
    sort_order: 0,
  },
  {
    kind: "BANK",
    label: "Société Générale — Compte secondaire",
    holder: "Marie Martin",
    bank_name: "Société Générale",
    iban: "FR14 2004 1010 0505 0001 3M02 606",
    bic: "SOGEFRPP",
    notes: "Compte de test — pour vérification du parcours d'achat uniquement.",
    is_default: false,
    is_active: true,
    sort_order: 1,
  },
];

// Clear existing rows (dev-only) and reseed with the two dummy accounts.
const { data: existing } = await client.database
  .from("payment_methods")
  .select("id");
if (existing?.length) {
  for (const row of existing) {
    await client.database.from("payment_methods").delete().eq("id", row.id);
  }
  console.log(`Cleared ${existing.length} existing method(s).`);
}

const { data, error } = await client.database
  .from("payment_methods")
  .insert(methods)
  .select();
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:", data);
