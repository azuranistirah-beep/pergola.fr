import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/features/auth/auth-shell";

export default async function RegisterPage({
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
      eyebrow={t("registerEyebrow")}
      title={t("registerTitle")}
      intro={t("registerIntro")}
      footer={
        <>
          {t("registerHaveAccount")}{" "}
          <Link
            href="/connexion"
            className="text-primary font-medium underline underline-offset-4"
          >
            {t("registerLogin")}
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="lg" className="w-full">
          {t("signupWithGoogle")}
        </Button>
        <Button variant="outline" size="lg" className="w-full">
          {t("signupWithGitHub")}
        </Button>
      </div>

      <div className="text-secondary my-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.25em]">
        <span className="bg-border h-px flex-1" /> {c("orLabel")}{" "}
        <span className="bg-border h-px flex-1" />
      </div>

      <form className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("firstName")} name="first" required />
          <Field label={t("lastName")} name="last" required />
        </div>
        <Field label={t("email")} name="email" type="email" required />
        <Field label={t("password")} name="password" type="password" required />
        <label className="text-secondary mt-2 flex items-start gap-3 text-xs">
          <input type="checkbox" required className="accent-primary mt-0.5" />
          <span>
            {t("termsBefore")}{" "}
            <Link
              href="/cgv"
              className="text-primary underline underline-offset-4"
            >
              {t("termsLink")}
            </Link>{" "}
            {t("termsMiddle")}{" "}
            <Link
              href="/confidentialite"
              className="text-primary underline underline-offset-4"
            >
              {t("privacyLink")}
            </Link>
            .
          </span>
        </label>
        <Button variant="primary" size="lg" className="w-full">
          {t("registerCta")}
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
