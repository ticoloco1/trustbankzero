import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  label: string;
  price: number;
  type: 'plan' | 'slug' | 'video' | 'cv';
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) => set((s) => ({ items: s.items.find(i => i.id === item.id) ? s.items : [...s.items, item] })),
      remove: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: 'trustbank-cart' }
  )
);
