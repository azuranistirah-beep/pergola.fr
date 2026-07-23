"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, KeyRound, UserX, UserCheck, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminSection,
  fieldClass,
} from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import {
  createAdminUser,
  resetAdminPassword,
  setAdminActive,
  deleteAdminUser,
} from "@/actions/admin-users-actions";

interface Row {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: Row[];
  currentUserId: string;
}) {
  const { t, locale } = useAdminT();
  const dateLocale = locale === "id" ? "id-ID" : "en-GB";
  const [showForm, setShowForm] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await createAdminUser(form);
      toast.success(t("users.created"));
      setForm({ name: "", email: "", password: "" });
      setShowForm(false);
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  const doReset = async (id: string) => {
    const pw = prompt(t("users.resetPasswordPrompt"));
    if (!pw) return;
    try {
      await resetAdminPassword(id, pw);
      toast.success(t("users.passwordReset"));
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const doToggle = async (id: string, active: boolean) => {
    try {
      await setAdminActive(id, active);
      toast.success(t("users.statusChanged"));
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const doDelete = async (id: string) => {
    if (!confirm(t("users.deleteConfirm"))) return;
    try {
      await deleteAdminUser(id);
      toast.success(t("users.deleted"));
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <>
      <AdminSection>
        {!showForm ? (
          <AdminButton
            type="button"
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            <Plus className="size-4" /> {t("users.new")}
          </AdminButton>
        ) : (
          <AdminCard>
            <form onSubmit={create} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-3">
                <AdminLabel label={t("users.form.name")}>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={fieldClass}
                  />
                </AdminLabel>
                <AdminLabel label={t("users.form.email")}>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={fieldClass}
                  />
                </AdminLabel>
                <AdminLabel
                  label={t("users.form.password")}
                  hint={t("users.form.passwordHint")}
                >
                  <input
                    required
                    type="password"
                    minLength={10}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={fieldClass}
                  />
                </AdminLabel>
              </div>
              <div className="flex gap-3">
                <AdminButton type="submit" variant="primary" disabled={pending}>
                  {pending ? t("common.saving") : t("users.form.submit")}
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  {t("common.cancel")}
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        )}
      </AdminSection>

      <AdminSection>
        <AdminCard className="p-0">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>{t("users.table.name")}</th>
                <th>{t("users.table.email")}</th>
                <th>{t("users.table.status")}</th>
                <th>{t("users.table.lastLogin")}</th>
                <th className="text-right">{t("users.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="hover:bg-muted/40">
                    <td className="text-primary px-6 py-4 font-medium">
                      {u.name}
                      {isSelf && (
                        <span className="text-secondary ml-2 text-[10px] uppercase tracking-[0.2em]">
                          ({t("users.you")})
                        </span>
                      )}
                    </td>
                    <td className="text-secondary px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] " +
                          (u.is_active
                            ? "bg-accent/15 text-accent"
                            : "bg-muted text-secondary")
                        }
                      >
                        {u.is_active ? t("users.active") : t("users.inactive")}
                      </span>
                    </td>
                    <td className="text-secondary px-6 py-4 text-xs">
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleString(dateLocale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : t("users.never")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => doReset(u.id)}
                          title={t("users.resetPassword")}
                          className="text-secondary hover:text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                        >
                          <KeyRound className="size-3.5" />
                        </button>
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => doToggle(u.id, !u.is_active)}
                              title={
                                u.is_active
                                  ? t("users.deactivate")
                                  : t("users.activate")
                              }
                              className="text-secondary hover:text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                            >
                              {u.is_active ? (
                                <UserX className="size-3.5" />
                              ) : (
                                <UserCheck className="size-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => doDelete(u.id)}
                              title={t("common.delete")}
                              className="text-secondary hover:text-accent inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminCard>
      </AdminSection>
    </>
  );
}
