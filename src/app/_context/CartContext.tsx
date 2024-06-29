'use client'
// _context/CartContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { ClientProducts } from '../_components/ProductList';

interface CartContextType {
  cart: ClientProducts[];
  setCart: React.Dispatch<React.SetStateAction<ClientProducts[]>>;
}

export const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartContextProvider');
  }
  return context;
};

export const CartContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<ClientProducts[]>([]);

  return <CartContext.Provider value={{ cart, setCart }}>{children}</CartContext.Provider>;
};
