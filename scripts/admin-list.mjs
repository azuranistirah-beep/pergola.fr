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

const { data, error } = await client.database
  .from("admin_users")
  .select("id, email, name, is_active, totp_enabled, created_at, last_login_at");

if (error) {
  console.error(error);
  process.exit(1);
}
console.table(data);
