import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/features/auth/auth-shell";

export const metadata = {
  title: "Connexion",
  description: "Accédez à votre espace client Pergola FR.",
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthShell
      eyebrow="Espace client"
      title="Content de vous revoir."
      intro="Suivez vos commandes, retrouvez vos devis et vos configurations sauvegardées."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="text-primary font-medium underline underline-offset-4"
          >
            Créer un compte
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="lg" className="w-full">
          Continuer avec Google
        </Button>
        <Button variant="outline" size="lg" className="w-full">
          Continuer avec GitHub
        </Button>
      </div>

      <div className="text-secondary my-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.25em]">
        <span className="bg-border h-px flex-1" /> ou <span className="bg-border h-px flex-1" />
      </div>

      <form className="flex flex-col gap-5">
        <Field label="Email" name="email" type="email" required />
        <Field label="Mot de passe" name="password" type="password" required />
        <div className="text-secondary flex justify-end text-xs">
          <Link
            href="/mot-de-passe-oublie"
            className="underline underline-offset-4"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <Button variant="primary" size="lg" className="mt-2 w-full">
          Se connecter
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
        className="border-border focus:border-primary bg-transparent border-b py-3 text-sm outline-none"
      />
    </div>
  );
}
