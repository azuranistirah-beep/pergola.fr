"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Props {
  placeholder: string;
  submitLabel: string;
}

export function NewsletterForm({ placeholder, submitLabel }: Props) {
  const t = useTranslations("newsletter");
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString().trim();
    if (!email) return;
    setPending(true);
    await new Promise((r) => setTimeout(r, 600));
    e.currentTarget.reset();
    setPending(false);
    toast.success(t("successTitle"), { description: t("successBody") });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="border-primary-foreground/20 focus-within:border-accent mt-5 flex items-center border-b py-3 transition-colors"
    >
      <input
        type="email"
        name="email"
        required
        placeholder={placeholder}
        className="placeholder:text-primary-foreground/40 flex-1 bg-transparent text-sm outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-accent text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-50"
      >
        {pending ? "…" : submitLabel}
      </button>
    </form>
  );
}
