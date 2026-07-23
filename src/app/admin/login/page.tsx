import { redirect } from "next/navigation";
import { loginAdmin, isAdmin, LoginBlockedError } from "@/lib/admin-auth";
import { getT } from "@/lib/admin-i18n";
import { LogoMark } from "@/components/brand/logo";

async function submit(formData: FormData) {
  "use server";
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  try {
    const result = await loginAdmin(email, password);
    if (result === "ok") redirect("/admin");
    if (result === "needs_totp") redirect("/admin/login/2fa");
    redirect("/admin/login?e=1");
  } catch (err) {
    if (err instanceof LoginBlockedError) {
      redirect("/admin/login?e=blocked");
    }
    throw err;
  }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { e } = await searchParams;
  const blocked = e === "blocked";
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
        <div className="border-accent/40 bg-accent/10 text-primary inline-flex size-14 items-center justify-center rounded-full border">
          <LogoMark className="size-7" />
        </div>
        <div className="text-accent mt-6 text-[10px] uppercase tracking-[0.3em]">
          {t("login.eyebrow")}
        </div>
        <h1 className="mt-2 font-serif text-3xl leading-tight">
          {t("login.title")}
        </h1>
        <p className="text-secondary mt-3 text-sm">{t("login.description")}</p>

        <form action={submit} className="mt-8 space-y-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-secondary text-[10px] uppercase tracking-[0.25em]"
            >
              {t("login.emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="username"
              className="border-border focus:border-primary border-b bg-transparent py-3 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-secondary text-[10px] uppercase tracking-[0.25em]"
            >
              {t("login.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border-border focus:border-primary border-b bg-transparent py-3 outline-none"
            />
          </div>
          {e && (
            <div className="border-accent/40 bg-accent/10 text-accent rounded-2xl border p-4 text-xs">
              {blocked ? t("login.blocked") : t("login.error")}
            </div>
          )}
          <button
            type="submit"
            className="bg-primary text-primary-foreground w-full rounded-full py-3 text-sm font-medium"
          >
            {t("login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
