"use client";

import * as React from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { formatEUR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PergolaProduct } from "@/features/products/types";

interface Props {
  open: boolean;
  onClose: () => void;
  catalog: PergolaProduct[];
}

const suggestions = [
  "Pergola bioclimatique",
  "Pergola bois cèdre",
  "Pergola adossée",
  "Cabana d'angle",
];

export function SearchDialog({ open, onClose, catalog }: Props) {
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const results = React.useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return catalog
      .filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.tagline.toLowerCase().includes(needle) ||
          p.family.toLowerCase().includes(needle) ||
          p.material.toLowerCase().includes(needle),
      )
      .slice(0, 6);
  }, [q, catalog]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
        className={cn(
          "bg-background fixed inset-x-0 top-0 z-[70] transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <Container className="py-6">
          <div className="border-border/60 flex items-center gap-4 border-b py-4">
            <SearchIcon className="text-secondary size-5 shrink-0" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une pergola, un matériau, une famille…"
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-secondary/50"
            />
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="hover:bg-muted rounded-full p-2 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {q.trim() === "" ? (
            <div className="py-10">
              <div className="text-secondary mb-4 text-[10px] uppercase tracking-[0.25em]">
                Suggestions
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="border-border hover:border-primary rounded-full border px-4 py-2 text-xs transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-secondary py-12 text-center text-sm">
              Aucun résultat pour <strong className="text-primary">« {q} »</strong>.
              Essayez « bioclimatique », « cèdre » ou « adossée ».
            </div>
          ) : (
            <ul className="divide-border/60 divide-y py-2">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/pergolas/${p.slug}`}
                    onClick={onClose}
                    className="hover:bg-muted -mx-4 flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors"
                  >
                    <div className="bg-muted aspect-square size-14 overflow-hidden rounded-xl">
                      {p.heroUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.heroUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-primary text-sm font-medium truncate">
                        {p.name}
                      </div>
                      <div className="text-secondary mt-0.5 text-xs truncate">
                        {p.tagline}
                      </div>
                    </div>
                    <div className="text-primary shrink-0 font-serif text-sm">
                      {formatEUR(p.priceCents)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </div>
    </>
  );
}
