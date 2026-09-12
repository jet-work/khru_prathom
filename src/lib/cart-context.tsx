"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  equipmentId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (equipmentId: string, quantity: number) => void;
  removeItem: (equipmentId: string) => void;
  updateQuantity: (equipmentId: string, quantity: number) => void;
  clear: () => void;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "khru-prathom-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage unavailable (private mode, etc.) — cart just stays empty for this session
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore write failures
    }
  }, [items, loaded]);

  function addItem(equipmentId: string, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.equipmentId === equipmentId);
      if (existing) {
        return prev.map((i) =>
          i.equipmentId === equipmentId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { equipmentId, quantity }];
    });
  }

  function removeItem(equipmentId: string) {
    setItems((prev) => prev.filter((i) => i.equipmentId !== equipmentId));
  }

  function updateQuantity(equipmentId: string, quantity: number) {
    setItems((prev) => prev.map((i) => (i.equipmentId === equipmentId ? { ...i, quantity } : i)));
  }

  function clear() {
    setItems([]);
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
