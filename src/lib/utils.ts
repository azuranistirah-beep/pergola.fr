import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEUR(cents: number, locale: string = "fr-FR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
