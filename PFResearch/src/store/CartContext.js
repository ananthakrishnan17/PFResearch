import React, { createContext, useContext, useReducer } from 'react';
import { cartReducer, initialCartState, CART_ACTIONS } from './cartReducer';
 
const CartContext = createContext(null);
 
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  return (
    <CartContext.Provider value={{ cart, dispatch, CART_ACTIONS }}>
      {children}
    </CartContext.Provider>
  );
}
 
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
 