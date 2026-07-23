"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminSection,
  fieldClass,
} from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import {
  confirmTotpEnrollment,
  disableTotp,
  startTotpEnrollment,
} from "@/actions/admin-account-actions";

export function TwoFAManager({ enrolled }: { enrolled: boolean }) {
  const { t } = useAdminT();
  const [pending, setPending] = React.useState(false);
  const [enrollment, setEnrollment] = React.useState<{
    secret: string;
    qrDataUrl: string;
  } | null>(null);
  const [code, setCode] = React.useState("");
  const [isEnrolled, setIsEnrolled] = React.useState(enrolled);

  const start = async () => {
    setPending(true);
    try {
      const { secret, qrDataUrl } = await startTotpEnrollment();
      setEnrollment({ secret, qrDataUrl });
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment) return;
    setPending(true);
    try {
      const ok = await confirmTotpEnrollment(enrollment.secret, code);
      if (ok) {
        toast.success(t("twofa.enabled"));
        setEnrollment(null);
        setCode("");
        setIsEnrolled(true);
      } else {
        toast.error(t("twofa.invalidCode"));
      }
    } finally {
      setPending(false);
    }
  };

  const disable = async () => {
    if (!confirm2fa(t("twofa.disableConfirm"))) return;
    setPending(true);
    try {
      await disableTotp();
      toast.success(t("twofa.disabled"));
      setIsEnrolled(false);
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminSection title={t("twofa.section")}>
      <AdminCard>
        {isEnrolled ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-accent mt-0.5 size-5" />
              <div>
                <div className="text-primary font-medium">
                  {t("twofa.status.on")}
                </div>
                <p className="text-secondary mt-1 text-xs">
                  {t("twofa.status.onDesc")}
                </p>
              </div>
            </div>
            <AdminButton
              type="button"
              variant="danger"
              onClick={disable}
              disabled={pending}
            >
              <ShieldOff className="size-4" /> {t("twofa.disable")}
            </AdminButton>
          </div>
        ) : !enrollment ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldOff className="text-secondary mt-0.5 size-5" />
              <div>
                <div className="text-primary font-medium">
                  {t("twofa.status.off")}
                </div>
                <p className="text-secondary mt-1 max-w-lg text-xs">
                  {t("twofa.status.offDesc")}
                </p>
              </div>
            </div>
            <AdminButton
              type="button"
              variant="primary"
              onClick={start}
              disabled={pending}
            >
              <ShieldCheck className="size-4" /> {t("twofa.enable")}
            </AdminButton>
          </div>
        ) : (
          <form onSubmit={confirm} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="bg-muted flex items-center justify-center rounded-2xl p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enrollment.qrDataUrl}
                  alt="TOTP QR"
                  width={200}
                  height={200}
                  className="size-[200px] rounded-xl bg-white p-2"
                />
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                    {t("twofa.step1")}
                  </div>
                  <p className="text-primary mt-2">{t("twofa.step1Desc")}</p>
                </div>
                <div>
                  <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                    {t("twofa.step2")}
                  </div>
                  <p className="text-primary mt-2">{t("twofa.step2Desc")}</p>
                  <code className="bg-muted mt-2 block rounded-xl px-3 py-2 font-mono text-xs">
                    {enrollment.secret}
                  </code>
                </div>
                <AdminLabel label={t("twofa.step3")}>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={
                      fieldClass +
                      " text-center text-xl font-mono tracking-[0.4em]"
                    }
                  />
                </AdminLabel>
              </div>
            </div>
            <div className="flex gap-3">
              <AdminButton type="submit" variant="primary" disabled={pending}>
                {pending ? t("common.saving") : t("twofa.confirm")}
              </AdminButton>
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => setEnrollment(null)}
              >
                {t("common.cancel")}
              </AdminButton>
            </div>
          </form>
        )}
      </AdminCard>
    </AdminSection>
  );
}

function confirm2fa(msg: string): boolean {
  return typeof window !== "undefined" && window.confirm(msg);
}
