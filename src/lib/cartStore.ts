import { create } from "zustand";

interface CartItem {
  id: string;
  quantity: number;
  sku?: string;
  imagenes?: string;
  precio?: number;
  producto?: string;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("cart_tecpoint") || "[]")
    : [],
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        // Incrementar cantidad si el producto ya existe
        const updatedCart = state.cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
        localStorage.setItem("cart_tecpoint", JSON.stringify(updatedCart));
        return { cart: updatedCart };
      }

      // Agregar nuevo producto
      const newCart = [...state.cart, item];
      localStorage.setItem("cart_tecpoint", JSON.stringify(newCart));
      return { cart: newCart };
    }),
  removeFromCart: (id) =>
    set((state) => {
      const updatedCart = state.cart.filter((item) => item.id !== id);
      localStorage.setItem("cart_tecpoint", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    }),
  updateQuantity: (id, quantity) =>
    set((state) => {
      const updatedCart = state.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      localStorage.setItem("cart_tecpoint", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    }),
  clearCart: () =>
    set(() => {
      localStorage.removeItem("cart_tecpoint");
      return { cart: [] };
    }),
}));
