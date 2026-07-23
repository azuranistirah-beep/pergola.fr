import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@insforge/sdk";

for (const file of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const [, , currentEmail, newEmail, newPassword] = process.argv;
if (!currentEmail || !newEmail || !newPassword) {
  console.error("Usage: node scripts/admin-set-credentials.mjs <current_email> <new_email> <new_password>");
  process.exit(1);
}

const client = createAdminClient({
  baseUrl: process.env.INSFORGE_URL,
  apiKey: process.env.INSFORGE_API_KEY,
});

const hash = await bcrypt.hash(newPassword, 12);
const { data, error } = await client.database
  .from("admin_users")
  .update({ email: newEmail.toLowerCase(), password_hash: hash })
  .eq("email", currentEmail.toLowerCase())
  .select("id, email, name");

if (error) {
  console.error(error);
  process.exit(1);
}
console.log("Updated:", data);
