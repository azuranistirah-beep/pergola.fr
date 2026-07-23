import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  getPendingUser,
  isAdmin,
  verifyTotpAndCompleteLogin,
} from "@/lib/admin-auth";
import { getT } from "@/lib/admin-i18n";

async function submit(formData: FormData) {
  "use server";
  const code = formData.get("code")?.toString() ?? "";
  const ok = await verifyTotpAndCompleteLogin(code);
  if (ok) redirect("/admin");
  redirect("/admin/login/2fa?e=1");
}

export default async function Admin2FAPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const pending = await getPendingUser();
  if (!pending) redirect("/admin/login");
  const { e } = await searchParams;
  const { t } = await getT();

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
          <ShieldCheck className="size-5" />
        </div>
        <div className="text-accent mt-6 text-[10px] uppercase tracking-[0.3em]">
          {t("login.eyebrow")}
        </div>
        <h1 className="mt-2 font-serif text-3xl leading-tight">
          {t("twofa.title")}
        </h1>
        <p className="text-secondary mt-3 text-sm">
          {t("twofa.description", { email: pending.email })}
        </p>

        <form action={submit} className="mt-8 space-y-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="code"
              className="text-secondary text-[10px] uppercase tracking-[0.25em]"
            >
              {t("twofa.codeLabel")}
            </label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              required
              autoFocus
              className="border-border focus:border-primary border-b bg-transparent py-3 text-center text-2xl font-mono tracking-[0.5em] outline-none"
            />
          </div>
          {e && (
            <div className="border-accent/40 bg-accent/10 text-accent rounded-2xl border p-4 text-xs">
              {t("twofa.invalidCode")}
            </div>
          )}
          <button
            type="submit"
            className="bg-primary text-primary-foreground w-full rounded-full py-3 text-sm font-medium"
          >
            {t("twofa.verify")}
          </button>
        </form>
      </div>
    </div>
  );
}
