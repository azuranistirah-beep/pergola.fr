import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/features/auth/auth-shell";

export const metadata = {
  title: "Créer un compte",
  description: "Rejoignez Pergola FR pour suivre vos commandes et devis.",
};

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthShell
      eyebrow="Créer un compte"
      title="Bienvenue chez Pergola FR."
      intro="Un espace pour suivre vos commandes, sauvegarder vos configurations et bénéficier d'un accompagnement dédié."
      footer={
        <>
          Vous avez déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="text-primary font-medium underline underline-offset-4"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="lg" className="w-full">
          S&apos;inscrire avec Google
        </Button>
        <Button variant="outline" size="lg" className="w-full">
          S&apos;inscrire avec GitHub
        </Button>
      </div>

      <div className="text-secondary my-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.25em]">
        <span className="bg-border h-px flex-1" /> ou <span className="bg-border h-px flex-1" />
      </div>

      <form className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" name="first" required />
          <Field label="Nom" name="last" required />
        </div>
        <Field label="Email" name="email" type="email" required />
        <Field label="Mot de passe" name="password" type="password" required />
        <label className="text-secondary mt-2 flex items-start gap-3 text-xs">
          <input
            type="checkbox"
            required
            className="accent-primary mt-0.5"
          />
          <span>
            J&apos;accepte les{" "}
            <Link href="/cgv" className="text-primary underline underline-offset-4">
              conditions générales de vente
            </Link>{" "}
            et la{" "}
            <Link
              href="/confidentialite"
              className="text-primary underline underline-offset-4"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        <Button variant="primary" size="lg" className="w-full">
          Créer mon compte
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
