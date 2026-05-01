"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartLine {
  skuId: string;
  name: string;
  priceMonthlyUsd: number;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  addSku: (skuId: string, name: string, priceMonthlyUsd: number) => void;
  removeSku: (skuId: string) => void;
  setQty: (skuId: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "a2a-commerce-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addSku = useCallback(
    (skuId: string, name: string, priceMonthlyUsd: number) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.skuId === skuId);
        if (existing) {
          return prev.map((l) =>
            l.skuId === skuId ? { ...l, qty: l.qty + 1 } : l,
          );
        }
        return [...prev, { skuId, name, priceMonthlyUsd, qty: 1 }];
      });
    },
    [],
  );

  const removeSku = useCallback((skuId: string) => {
    setLines((prev) => prev.filter((l) => l.skuId !== skuId));
  }, []);

  const setQty = useCallback((skuId: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.skuId === skuId ? { ...l, qty: Math.max(0, qty) } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.priceMonthlyUsd * l.qty, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      addSku,
      removeSku,
      setQty,
      clear,
      subtotal,
    }),
    [lines, addSku, removeSku, setQty, clear, subtotal],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
