export const CART_ACTIONS = {
  ADD_ITEM:      'ADD_ITEM',
  INCREMENT:     'INCREMENT',
  DECREMENT:     'DECREMENT',
  REMOVE_ITEM:   'REMOVE_ITEM',
  CLEAR_CART:    'CLEAR_CART',
  SET_DISCOUNT:  'SET_DISCOUNT',
  SET_NOTE:      'SET_NOTE',
  SET_CUSTOMER:  'SET_CUSTOMER',
};
 
export const initialCartState = {
  lines:     [],   // [{ uuid, productId, name, emoji, priceUnit, qty, discount, note, subtotal }]
  customer:  null,
  note:      '',
};
 
export function cartReducer(state, action) {
  switch (action.type) {
 
    case CART_ACTIONS.ADD_ITEM: {
      const existing = state.lines.find(l => l.productId === action.product.id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map(l =>
            l.productId === action.product.id
              ? { ...l, qty: l.qty + 1, subtotal: calcSubtotal(l.priceUnit, l.qty + 1, l.discount) }
              : l
          ),
        };
      }
      const newLine = {
        uuid:       crypto.randomUUID(),
        productId:  action.product.id,
        name:       action.product.name,
        emoji:      action.product.emoji || '📦',
        priceUnit:  action.product.lstPrice,
        qty:        1,
        discount:   0,
        note:       '',
        subtotal:   action.product.lstPrice,
      };
      return { ...state, lines: [...state.lines, newLine] };
    }
 
    case CART_ACTIONS.INCREMENT:
      return {
        ...state,
        lines: state.lines.map(l =>
          l.uuid === action.uuid
            ? { ...l, qty: l.qty + 1, subtotal: calcSubtotal(l.priceUnit, l.qty + 1, l.discount) }
            : l
        ),
      };
 
    case CART_ACTIONS.DECREMENT: {
      const line = state.lines.find(l => l.uuid === action.uuid);
      if (!line) return state;
      if (line.qty <= 1) {
        return { ...state, lines: state.lines.filter(l => l.uuid !== action.uuid) };
      }
      return {
        ...state,
        lines: state.lines.map(l =>
          l.uuid === action.uuid
            ? { ...l, qty: l.qty - 1, subtotal: calcSubtotal(l.priceUnit, l.qty - 1, l.discount) }
            : l
        ),
      };
    }
 
    case CART_ACTIONS.REMOVE_ITEM:
      return { ...state, lines: state.lines.filter(l => l.uuid !== action.uuid) };
 
    case CART_ACTIONS.CLEAR_CART:
      return { ...initialCartState };
 
    case CART_ACTIONS.SET_DISCOUNT:
      return {
        ...state,
        lines: state.lines.map(l =>
          l.uuid === action.uuid
            ? { ...l, discount: action.discount,
                subtotal: calcSubtotal(l.priceUnit, l.qty, action.discount) }
            : l
        ),
      };
 
    case CART_ACTIONS.SET_NOTE:
      return {
        ...state,
        lines: state.lines.map(l =>
          l.uuid === action.uuid ? { ...l, note: action.note } : l
        ),
      };
 
    case CART_ACTIONS.SET_CUSTOMER:
      return { ...state, customer: action.customer };
 
    default:
      return state;
  }
}
 
// ── Helpers ───────────────────────────────────────────────
function calcSubtotal(priceUnit, qty, discountPct) {
  const discounted = priceUnit * (1 - (discountPct || 0) / 100);
  return Math.round(discounted * qty * 100) / 100;
}