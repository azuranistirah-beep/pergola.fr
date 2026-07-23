"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitContactMessage } from "@/actions/public-actions";

export function ContactForm() {
  const t = useTranslations("contactPage.form");
  const locale = useLocale();
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    try {
      await submitContactMessage({
        name: fd.get("name")?.toString() ?? "",
        email: fd.get("email")?.toString() ?? "",
        phone: fd.get("phone")?.toString() || undefined,
        postal: fd.get("postal")?.toString() || undefined,
        message: fd.get("message")?.toString() ?? "",
        locale,
        website: fd.get("website")?.toString() ?? "",
      });
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
    <form onSubmit={onSubmit} className="mt-12 grid gap-5">
      {/* Honeypot: bots fill this, humans don't see it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
      />
      <Field label={t("name")} name="name" required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("email")} type="email" name="email" required />
        <Field label={t("phone")} type="tel" name="phone" />
      </div>
      <Field label={t("postal")} name="postal" />
      <div className="flex flex-col gap-2">
        <label className="text-secondary text-[10px] uppercase tracking-[0.25em]">
          {t("projectLabel")}
        </label>
        <textarea
          name="message"
          rows={5}
          required
          placeholder={t("projectPlaceholder")}
          className="border-border focus:border-primary placeholder:text-secondary/50 resize-none border-b bg-transparent py-3 text-sm outline-none"
        />
      </div>
      <Button
        variant="primary"
        size="lg"
        className="w-full sm:w-auto"
        disabled={pending}
      >
        {pending ? t("submitPending") : t("submit")}
      </Button>
      <p className="text-secondary text-xs">{t("consent")}</p>
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
