import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/features/auth/auth-shell";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const c = await getTranslations("common");
  return (
    <AuthShell
      eyebrow={t("loginEyebrow")}
      title={t("loginTitle")}
      intro={t("loginIntro")}
      footer={
        <>
          {t("loginNoAccount")}{" "}
          <Link
            href="/inscription"
            className="text-primary font-medium underline underline-offset-4"
          >
            {t("loginRegister")}
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="lg" className="w-full">
          {t("continueWithGoogle")}
        </Button>
        <Button variant="outline" size="lg" className="w-full">
          {t("continueWithGitHub")}
        </Button>
      </div>

      <div className="text-secondary my-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.25em]">
        <span className="bg-border h-px flex-1" /> {c("orLabel")}{" "}
        <span className="bg-border h-px flex-1" />
      </div>

      <form className="flex flex-col gap-5">
        <Field label={t("email")} name="email" type="email" required />
        <Field label={t("password")} name="password" type="password" required />
        <div className="text-secondary flex justify-end text-xs">
          <Link
            href="/mot-de-passe-oublie"
            className="underline underline-offset-4"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <Button variant="primary" size="lg" className="mt-2 w-full">
          {t("loginCta")}
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-secondary text-[10px] uppercase tracking-[0.25em]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="border-border focus:border-primary border-b bg-transparent py-3 text-sm outline-none"
      />
    </div>
  );
}
