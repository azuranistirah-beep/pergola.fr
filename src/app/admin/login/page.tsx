import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { loginAdmin, isAdmin } from "@/lib/admin-auth";

async function submit(formData: FormData) {
  "use server";
  const password = formData.get("password")?.toString() ?? "";
  const ok = await loginAdmin(password);
  if (ok) redirect("/admin");
  redirect("/admin/login?e=1");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { e } = await searchParams;

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(70% 60% at 30% 20%, rgba(200,164,107,0.25) 0%, rgba(17,17,17,0) 60%), linear-gradient(180deg, #14100b 0%, #0f0d0a 100%)",
      }}
    >
      <div className="bg-background w-full max-w-md rounded-3xl p-10 shadow-[var(--shadow-elevated)]">
        <div className="border-accent/40 bg-accent/10 text-accent inline-flex size-12 items-center justify-center rounded-full border">
          <LogIn className="size-5" />
        </div>
        <div className="text-accent mt-6 text-[10px] uppercase tracking-[0.3em]">
          Pergola FR — Admin
        </div>
        <h1 className="mt-2 font-serif text-3xl leading-tight">
          Espace administrateur
        </h1>
        <p className="text-secondary mt-3 text-sm">
          Saisissez le mot de passe administrateur pour accéder au dashboard.
        </p>

        <form action={submit} className="mt-8 space-y-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-secondary text-[10px] uppercase tracking-[0.25em]"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="border-border focus:border-primary border-b bg-transparent py-3 outline-none"
            />
          </div>
          {e && (
            <div className="border-accent/40 bg-accent/10 text-accent rounded-2xl border p-4 text-xs">
              Mot de passe incorrect.
            </div>
          )}
          <button
            type="submit"
            className="bg-primary text-primary-foreground w-full rounded-full py-3 text-sm font-medium"
          >
            Entrer
          </button>
        </form>
      </div>
    </div>
  );
}
