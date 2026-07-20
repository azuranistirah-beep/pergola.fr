import { createAdminClient } from "@insforge/sdk";

const url = process.env.INSFORGE_URL;
const apiKey = process.env.INSFORGE_API_KEY;

if (!url || !apiKey) {
  throw new Error(
    "Missing INSFORGE_URL / INSFORGE_API_KEY (server-only admin client).",
  );
}

/**
 * Full-access admin client for /admin server actions. NEVER import this file
 * from a "use client" component — it holds a service-role key.
 */
export const insforgeAdmin = createAdminClient({ baseUrl: url, apiKey });
