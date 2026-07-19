import { createClient } from "@insforge/sdk";

const url = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_INSFORGE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY. " +
      "Run `npx @insforge/cli secrets get ANON_KEY` to fetch the anon key.",
  );
}

export const insforge = createClient({ baseUrl: url, anonKey });
