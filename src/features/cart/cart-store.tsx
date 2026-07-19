"use client";

import * as React from "react";

export interface CartLine {
  id: string;
  productSlug: string;
  name: string;
  sku: string;
  imageUrl?: string;
  unitPriceCents: number;
  quantity: number;
  configuration?: Record<string, string | number>;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "id">) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  subtotalCents: number;
  count: number;
}

const CartContext = React.createContext<CartState | null>(null);
const KEY = "pergolafr:cart:v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const value = React.useMemo<CartState>(() => {
    return {
      lines,
      add: (line) =>
        setLines((prev) => [
          ...prev,
          { ...line, id: `${line.productSlug}-${Date.now()}` },
        ]),
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      setQuantity: (id, qty) =>
        setLines((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, quantity: Math.max(1, qty) } : l,
          ),
        ),
      clear: () => setLines([]),
      subtotalCents: lines.reduce(
        (s, l) => s + l.unitPriceCents * l.quantity,
        0,
      ),
      count: lines.reduce((s, l) => s + l.quantity, 0),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
