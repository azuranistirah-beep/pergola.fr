import React, { useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";

export default function ContactPage() {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    setErr("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          locale,
        }),
      });
      if (!res.ok) throw new Error("Send failed");
      setStatus("ok");
      e.target.reset();
    } catch (e2) {
      setStatus("err");
      setErr(e2.message);
    }
  }

  return (
    <section className="section">
      <div className="shell page-head">
        <h1>{t("contact.title")}</h1>
        <p>{t("contact.subtitle")}</p>
      </div>
      <div className="shell contact-form">
        <form onSubmit={onSubmit} className="grid-2">
          <input name="name" placeholder={t("contact.name")} required />
          <input name="email" type="email" placeholder={t("contact.email")} required />
          <input name="phone" placeholder={t("contact.phone")} />
          <input name="subject" placeholder={t("contact.subject")} />
          <textarea name="message" placeholder={t("contact.message")} rows={6} required className="wide" />
          <button type="submit" className="button button--primary wide" disabled={status === "sending"}>
            {t("contact.send")}
          </button>
          {status === "ok" && <p className="ok wide">{t("contact.success")}</p>}
          {status === "err" && <p className="err wide">Error: {err}</p>}
        </form>
      </div>
    </section>
  );
}
