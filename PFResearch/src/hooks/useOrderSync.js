import { useState, useCallback } from 'react';
import { orderApi } from '../api';
 
export function useOrderSync() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
 
  // Build the sync payload from cart + payment info
  const buildPayload = useCallback((sessionId, cart, payment) => {
    return {
      sessionId,
      orders: [{
        uuid:      crypto.randomUUID(),
        sessionId,
        state:     'paid',
        lines: cart.lines.map(line => ({
          uuid:               line.uuid,
          productId:          line.productId,
          qty:                line.qty,
          priceUnit:          line.priceUnit,
          discount:           line.discount || 0,
          priceSubtotal:      line.subtotal,
          priceSubtotalIncl:  line.subtotal,  // tax-inclusive – server recomputes
          fullProductName:    line.name,
          customerNote:       line.note || '',
        })),
        payments: [{
          uuid:            crypto.randomUUID(),
          paymentMethodId: payment.methodId,
          amount:          payment.tendered,
        }],
      }],
    };
  }, []);
 
  const syncOrder = useCallback(async (sessionId, cart, payment) => {
    setLoading(true); setError(null);
    try {
      const payload = buildPayload(sessionId, cart, payment);
      const res = await orderApi.sync(sessionId, payload.orders);
      return { success: true, orderIds: res.orderIds };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [buildPayload]);
 
  return { syncOrder, loading, error };
}
 