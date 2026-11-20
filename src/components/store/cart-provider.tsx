import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  addItem as addItemFn,
  cartCount,
  cartTotal,
  removeItem as removeItemFn,
  setQuantity as setQuantityFn,
  type CartItem,
  type CartProductInput,
} from "@/lib/cart";

const STORAGE_KEY = "gameland-cart-v1";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (product: CartProductInput, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  bump: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore corrupted storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add = useCallback((product: CartProductInput, quantity = 1) => {
    setItems((prev) => addItemFn(prev, product, quantity));
    setBump((b) => b + 1);
  }, []);
  const setQuantity = useCallback(
    (id: string, q: number) => setItems((prev) => setQuantityFn(prev, id, q)),
    [],
  );
  const remove = useCallback((id: string) => setItems((prev) => removeItemFn(prev, id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: cartCount(items),
      total: cartTotal(items),
      isOpen,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
      bump,
    }),
    [items, isOpen, add, setQuantity, remove, clear, bump],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
