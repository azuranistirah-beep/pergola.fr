import { setAdminLocale, type AdminLocale, ADMIN_LOCALES } from "@/lib/admin-i18n";
import { revalidatePath } from "next/cache";

async function changeLocale(formData: FormData) {
  "use server";
  const next = formData.get("locale")?.toString() as AdminLocale;
  if ((ADMIN_LOCALES as readonly string[]).includes(next)) {
    await setAdminLocale(next);
    revalidatePath("/admin", "layout");
  }
}

export function AdminLocaleToggle({
  locale,
  label,
}: {
  locale: AdminLocale;
  label: string;
}) {
  return (
    <form action={changeLocale} className="flex items-center gap-2">
      <span className="text-primary-foreground/40 text-[10px] uppercase tracking-[0.3em]">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {ADMIN_LOCALES.map((l) => (
          <button
            key={l}
            type="submit"
            name="locale"
            value={l}
            className={
              "rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] transition-colors " +
              (l === locale
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "text-primary-foreground/50 hover:text-primary-foreground")
            }
          >
            {l}
          </button>
        ))}
      </div>
    </form>
  );
}
