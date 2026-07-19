"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    // Placeholder — wire to InsForge functions once backend endpoint exists.
    await new Promise((r) => setTimeout(r, 800));
    e.currentTarget.reset();
    setPending(false);
    toast.success("Message envoyé", {
      description:
        "Notre équipe vous répond sous 48h ouvrées. Un email de confirmation vient de partir.",
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-12 grid gap-5">
      <Field label="Prénom et nom" name="name" required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Email" type="email" name="email" required />
        <Field label="Téléphone" type="tel" name="phone" />
      </div>
      <Field label="Code postal" name="postal" />
      <div className="flex flex-col gap-2">
        <label className="text-secondary text-[10px] uppercase tracking-[0.25em]">
          Votre projet
        </label>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Type de pergola envisagée, dimensions approximatives, contraintes du site…"
          className="border-border focus:border-primary placeholder:text-secondary/50 resize-none border-b bg-transparent py-3 text-sm outline-none"
        />
      </div>
      <Button
        variant="primary"
        size="lg"
        className="w-full sm:w-auto"
        disabled={pending}
      >
        {pending ? "Envoi en cours…" : "Envoyer ma demande"}
      </Button>
      <p className="text-secondary text-xs">
        En envoyant ce formulaire, vous acceptez notre politique de
        confidentialité. Nous vous répondons sous 48h ouvrées.
      </p>
    </form>
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
        {required && " *"}
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
