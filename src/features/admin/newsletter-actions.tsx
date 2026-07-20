"use client";

import { toast } from "sonner";
import { Download, UserX } from "lucide-react";
import { AdminButton } from "@/features/admin/admin-ui";
import { unsubscribeNewsletter } from "@/actions/admin-inbox-actions";

interface Subscriber {
  email: string;
  locale: string;
  subscribed_at: string;
}

export function NewsletterExport({ rows }: { rows: Subscriber[] }) {
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
      <Download className="size-3.5" /> Export CSV
    </AdminButton>
  );
}

export function UnsubscribeButton({ email }: { email: string }) {
  return (
    <button
      onClick={async () => {
        if (!confirm(`Désinscrire ${email} ?`)) return;
        try {
          await unsubscribeNewsletter(email);
          toast.success("Désinscrit");
        } catch (e) {
          toast.error("Erreur", {
            description: e instanceof Error ? e.message : String(e),
          });
        }
      }}
      className="text-secondary hover:text-accent inline-flex items-center gap-1 text-xs"
      title="Désinscrire"
    >
      <UserX className="size-3.5" />
    </button>
  );
}
