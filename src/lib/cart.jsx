import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LS_KEY = "pergolafr.cart";
const CartCtx = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: [] };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const add = useCallback((product, qty = 1, variantId = null) => {
    setCart((c) => {
      const key = `${product.id}::${variantId || ""}`;
      const existing = c.items.find((i) => i.key === key);
      if (existing) {
        return {
          items: c.items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + qty } : i)),
        };
      }
      return {
        items: [
          ...c.items,
          {
            key,
            product_id: product.id,
            variant_id: variantId,
            slug: product.slug,
            name: product.name,
            image: product.images?.[0]?.url || null,
            unit_price_cents: product.price_cents,
            quantity: qty,
          },
        ],
      };
    });
  }, []);

  const remove = useCallback((key) => {
    setCart((c) => ({ items: c.items.filter((i) => i.key !== key) }));
  }, []);

  const setQty = useCallback((key, qty) => {
    setCart((c) => ({
      items: c.items
        .map((i) => (i.key === key ? { ...i, quantity: Math.max(1, qty) } : i))
        .filter((i) => i.quantity > 0),
    }));
  }, []);

  const clear = useCallback(() => setCart({ items: [] }), []);

  const totals = useMemo(() => {
    const subtotal = cart.items.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);
    const count = cart.items.reduce((s, i) => s + i.quantity, 0);
    return { subtotal, count };
  }, [cart]);

  return (
    <CartCtx.Provider value={{ cart, add, remove, setQty, clear, totals }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
