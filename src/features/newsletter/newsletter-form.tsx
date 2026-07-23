"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/actions/public-actions";

interface Props {
  placeholder: string;
  submitLabel: string;
}

export function NewsletterForm({ placeholder, submitLabel }: Props) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email")?.toString().trim();
    if (!email) return;
    const honeypot = fd.get("website")?.toString() ?? "";
    const form = e.currentTarget;
    setPending(true);
    try {
      await subscribeNewsletter(email, locale, honeypot);
      form.reset();
      toast.success(t("successTitle"), { description: t("successBody") });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="border-primary-foreground/20 focus-within:border-accent mt-5 flex items-center border-b py-3 transition-colors"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
      />
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
