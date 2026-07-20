import * as React from "react";
import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-background border-border/60 sticky top-0 z-10 flex flex-wrap items-end justify-between gap-4 border-b p-8">
      <div>
        <h1 className="font-serif text-3xl leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-secondary mt-1 text-sm">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("p-8", className)}>
      {(title || description) && (
        <header className="mb-6">
          {title && (
            <h2 className="text-primary font-serif text-xl">{title}</h2>
          )}
          {description && (
            <p className="text-secondary mt-1 text-sm">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

export function AdminCard({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-background border-border/60 rounded-3xl border p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminButton({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:opacity-90",
        variant === "outline" &&
          "border-border text-primary hover:border-primary border",
        variant === "danger" &&
          "border-accent/50 text-accent hover:bg-accent/10 border",
        className,
      )}
      {...props}
    />
  );
}

export function AdminLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
        {label}
      </span>
      {children}
      {hint && <span className="text-secondary text-xs">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "border-border focus:border-primary bg-background border-b py-2 text-sm outline-none";

export const fieldClass =
  "border-border focus:border-primary bg-background rounded-xl border px-3 py-2 text-sm outline-none";

export function KpiCard({
  label,
  value,
  hint,
  Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <AdminCard>
      <div className="text-secondary flex items-center justify-between text-[10px] uppercase tracking-[0.25em]">
        {label}
        {Icon && <Icon className="text-accent size-4" />}
      </div>
      <div className="mt-4 font-serif text-4xl">{value}</div>
      {hint && <div className="text-secondary mt-2 text-xs">{hint}</div>}
    </AdminCard>
  );
}
