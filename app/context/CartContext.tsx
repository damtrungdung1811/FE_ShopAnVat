"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: number;
  khachHangId?: number; // Not strictly needed in cart context but good to have
  sanPhamId: number;
  tenSanPham: string;
  hinhAnh: string;
  giaMoi: number;
  soLuong: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "soLuong">) => void;
  removeFromCart: (sanPhamId: number) => void;
  updateQuantity: (sanPhamId: number, soLuong: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getCartKey = () => {
    if (typeof window === "undefined") return "shopping_cart_guest";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr && userStr !== "undefined") {
        const user = JSON.parse(userStr);
        // Ưu tiên username từ API
        const identifier = user.username || user.id || user.tenDangNhap;
        if (identifier) {
          return `shopping_cart_${identifier}`;
        }
      }
    } catch(e) {}
    return "shopping_cart_guest";
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(getCartKey());
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from local storage", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(getCartKey(), JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (item: Omit<CartItem, "soLuong">) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.sanPhamId === item.sanPhamId);
      if (existingItem) {
        return prev.map((i) =>
          i.sanPhamId === item.sanPhamId
            ? { ...i, soLuong: i.soLuong + 1 }
            : i
        );
      }
      return [...prev, { ...item, soLuong: 1 }];
    });
  };

  const removeFromCart = (sanPhamId: number) => {
    setCart((prev) => prev.filter((i) => i.sanPhamId !== sanPhamId));
  };

  const updateQuantity = (sanPhamId: number, soLuong: number) => {
    if (soLuong <= 0) return;
    setCart((prev) =>
      prev.map((i) => (i.sanPhamId === sanPhamId ? { ...i, soLuong } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.soLuong, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.giaMoi * item.soLuong, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
