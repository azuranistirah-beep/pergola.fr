"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  deleteContact,
  updateContactStatus,
} from "@/actions/admin-inbox-actions";
import { AdminButton } from "@/features/admin/admin-ui";

type Status = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export function ContactActionsBar({
  id,
  current,
}: {
  id: string;
  current: Status;
}) {
  const set = async (next: Status) => {
    try {
      await updateContactStatus(id, next);
      toast.success("Statut mis à jour");
    } catch (e) {
      toast.error("Erreur", {
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const remove = async () => {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      await deleteContact(id);
      toast.success("Message supprimé");
    } catch (e) {
      toast.error("Erreur", {
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={current}
        onChange={(e) => set(e.target.value as Status)}
        className="border-border focus:border-primary rounded-full border bg-transparent px-3 py-1 text-xs outline-none"
      >
        <option value="NEW">Nouveau</option>
        <option value="READ">Lu</option>
        <option value="REPLIED">Répondu</option>
        <option value="ARCHIVED">Archivé</option>
      </select>
      <AdminButton variant="danger" onClick={remove}>
        <Trash2 className="size-3.5" />
      </AdminButton>
    </div>
  );
}
