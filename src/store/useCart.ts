import { create } from "zustand";

export type CartItemType = "subscription_monthly" | "subscription_annual" | "slug_standard" | "slug_premium" | "slug_listing" | "boost";

export interface CartItem {
  id: string;
  type: CartItemType;
  label: string;
  price: number; // USD
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  addItemAndOpen: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: () => number;
  open: () => void;
  close: () => void;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: (item) => {
    const exists = get().items.find((i) => i.id === item.id);
    if (exists) return;
    set((s) => ({ items: [...s.items, item] }));
  },
  addItemAndOpen: (item) => {
    const exists = get().items.find((i) => i.id === item.id);
    if (!exists) set((s) => ({ items: [...s.items, item] }));
    set({ isOpen: true });
  },
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
