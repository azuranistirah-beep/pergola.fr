"use client";

import { toast } from "sonner";
import { Download, UserX } from "lucide-react";
import { AdminButton } from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import { unsubscribeNewsletter } from "@/actions/admin-inbox-actions";

interface Subscriber {
  email: string;
  locale: string;
  subscribed_at: string;
}

export function NewsletterExport({ rows }: { rows: Subscriber[] }) {
  const { t } = useAdminT();
  const download = () => {
    const csv = [
      "email,locale,subscribed_at",
      ...rows.map(
        (r) => `${r.email},${r.locale},${new Date(r.subscribed_at).toISOString()}`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <AdminButton variant="outline" onClick={download}>
      <Download className="size-3.5" /> {t("newsletter.export")}
    </AdminButton>
  );
}

export function UnsubscribeButton({ email }: { email: string }) {
  const { t } = useAdminT();
  return (
    <button
      onClick={async () => {
        if (!confirm(t("newsletter.unsubscribeConfirm", { email }))) return;
        try {
          await unsubscribeNewsletter(email);
          toast.success(t("newsletter.unsubscribed"));
        } catch (e) {
          toast.error(t("common.error"), {
            description: e instanceof Error ? e.message : String(e),
          });
        }
      }}
      className="text-secondary hover:text-accent inline-flex items-center gap-1 text-xs"
      title={t("newsletter.unsubscribeLabel")}
    >
      <UserX className="size-3.5" />
    </button>
  );
}
