import { useMemo } from 'react';
 
const TAX_RATE = 0.05; // 5% – in production load from config
 
export function useOrderTotals(lines) {
  return useMemo(() => {
    const subtotal  = lines.reduce((s, l) => s + l.subtotal, 0);
    const tax       = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total     = Math.round((subtotal + tax) * 100) / 100;
    const itemCount = lines.reduce((s, l) => s + l.qty, 0);
    return { subtotal, tax, total, itemCount };
  }, [lines]);
}