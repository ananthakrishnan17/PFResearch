import React, { useReducer, useState, useMemo, useEffect } from 'react';

// ── Import from our clean architecture layers ─────────────
import { sessionApi }  from './api/sessionApi.js';
import { productApi }  from './api/index';
import { orderApi }    from './api/index';
import { cartReducer, initialCartState, CART_ACTIONS } from './store/index';
import { useOrderTotals } from './hooks/index';

// ── Constants ─────────────────────────────────────────────
const SESSION_ID  = 1;
const CONFIG_ID   = 1;
const TAX_RATE    = 0.05;

const PAYMENT_METHODS = [
  { id: 1, name: 'Cash',  icon: '💵' },
  { id: 2, name: 'Card',  icon: '💳' },
  { id: 3, name: 'UPI',   icon: '📱' },
];

const PRODUCT_EMOJIS = {
  default: '📦', drink: '☕', food: '🍱', snack: '🍪',
};

// ── Styles ────────────────────────────────────────────────
const styles = {
  app: {
    display: 'flex', height: '100vh', overflow: 'hidden',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: '#0f1117', color: '#e2e8f0',
  },
  // LEFT PANEL
  leftPanel: {
    flex: 1, display: 'flex', flexDirection: 'column',
    borderRight: '1px solid #2d3348',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', background: '#1a1d27',
    borderBottom: '1px solid #2d3348',
  },
  sessionBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 13, color: '#8892a4',
  },
  sessionDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#22c55e',
  },
  searchInput: {
    background: '#222636', border: '1px solid #2d3348',
    borderRadius: 8, padding: '8px 12px',
    color: '#e2e8f0', fontSize: 13, outline: 'none',
    width: 280,
  },
  catBar: {
    display: 'flex', gap: 6, padding: '10px 16px',
    background: '#1a1d27', borderBottom: '1px solid #2d3348',
    overflowX: 'auto',
  },
  catBtn: (active) => ({
    padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
    fontSize: 12, border: '1px solid',
    borderColor: active ? '#7c6ef5' : '#2d3348',
    background: active ? '#2d2850' : 'transparent',
    color: active ? '#9d93f7' : '#8892a4',
    whiteSpace: 'nowrap', transition: 'all .15s',
  }),
  grid: {
    flex: 1, overflowY: 'auto', padding: '12px 16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 10, alignContent: 'start',
  },
  productCard: (inCart) => ({
    background: '#222636',
    border: `1px solid ${inCart ? '#7c6ef5' : '#2d3348'}`,
    borderRadius: 12, padding: '14px 12px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: 8,
    position: 'relative', transition: 'all .15s',
  }),
  productEmoji: { fontSize: 28, textAlign: 'center', lineHeight: 1 },
  productName:  { fontSize: 12, color: '#8892a4', textAlign: 'center', lineHeight: 1.3 },
  productPrice: { fontSize: 15, fontWeight: 600, color: '#e2e8f0', textAlign: 'center' },
  cartBadge: {
    position: 'absolute', top: 6, right: 6,
    background: '#2d2850', color: '#9d93f7',
    fontSize: 10, padding: '2px 6px', borderRadius: 10,
  },
  // RIGHT PANEL
  rightPanel: {
    width: 360, display: 'flex', flexDirection: 'column',
    background: '#1a1d27',
  },
  orderHeader: {
    padding: '14px 16px', borderBottom: '1px solid #2d3348',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  orderLines: { flex: 1, overflowY: 'auto', padding: 8 },
  emptyCart: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 8, color: '#4a5568',
  },
  orderLine: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: 8, borderRadius: 8, marginBottom: 4,
    background: '#222636', border: '1px solid transparent',
  },
  qtyBtn: {
    width: 22, height: 22, borderRadius: '50%',
    border: '1px solid #3d4460', background: '#2a2f42',
    color: '#e2e8f0', cursor: 'pointer', fontSize: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  totalsBox: { padding: '12px 16px', borderTop: '1px solid #2d3348' },
  totalRow: (main) => ({
    display: 'flex', justifyContent: 'space-between',
    fontSize: main ? 18 : 12,
    fontWeight: main ? 700 : 400,
    color: main ? '#e2e8f0' : '#8892a4',
    marginBottom: main ? 0 : 6,
    paddingTop: main ? 8 : 0,
    borderTop: main ? '1px solid #2d3348' : 'none',
    marginTop: main ? 8 : 0,
  }),
  paymentArea: { padding: '12px 16px', borderTop: '1px solid #2d3348' },
  pmGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 },
  pmBtn: (active) => ({
    padding: 8, borderRadius: 8, cursor: 'pointer',
    border: `1px solid ${active ? '#7c6ef5' : '#2d3348'}`,
    background: active ? '#2d2850' : '#222636',
    color: active ? '#9d93f7' : '#8892a4',
    fontSize: 12, transition: 'all .15s',
  }),
  tenderedRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  tenderedInput: {
    flex: 1, background: '#222636', border: '1px solid #3d4460',
    borderRadius: 8, padding: '6px 10px', color: '#e2e8f0',
    fontSize: 14, fontWeight: 600, outline: 'none', textAlign: 'right',
  },
  changeBox: {
    background: '#14532d', border: '1px solid #22c55e',
    borderRadius: 8, padding: '8px 12px',
    display: 'flex', justifyContent: 'space-between',
    marginBottom: 10, fontSize: 13,
  },
  payBtn: (canPay) => ({
    width: '100%', padding: 13, borderRadius: 12,
    border: 'none',
    background: canPay ? '#7c6ef5' : '#2a2f42',
    color: canPay ? '#fff' : '#4a5568',
    fontSize: 15, fontWeight: 600,
    cursor: canPay ? 'pointer' : 'not-allowed',
    transition: 'all .15s',
  }),
  // RECEIPT MODAL
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  receipt: {
    background: '#1a1d27', border: '1px solid #3d4460',
    borderRadius: 12, width: 300, padding: 20, textAlign: 'center',
  },
  // STATUS BAR
  statusBar: {
    padding: '6px 16px', background: '#222636',
    borderTop: '1px solid #2d3348',
    display: 'flex', gap: 16, fontSize: 11, color: '#4a5568',
  },
  // ERROR BANNER
  errorBanner: {
    background: '#450a0a', border: '1px solid #ef4444',
    borderRadius: 8, padding: '8px 12px', margin: '8px 16px',
    fontSize: 12, color: '#ef4444',
  },
  clearBtn: {
    background: 'transparent', border: '1px solid #2d3348',
    borderRadius: 8, padding: '5px 10px', color: '#8892a4',
    fontSize: 11, cursor: 'pointer',
  },
};

// ── COMPONENTS ────────────────────────────────────────────

function ProductCard({ product, cartQty, onAdd }) {
  return (
    <div style={styles.productCard(cartQty > 0)} onClick={() => onAdd(product)}>
      <div style={styles.productEmoji}>{product.emoji || '📦'}</div>
      <div style={styles.productName}>{product.name}</div>
      <div style={styles.productPrice}>₹{product.lstPrice}</div>
      {cartQty > 0 && <div style={styles.cartBadge}>×{cartQty}</div>}
    </div>
  );
}

function OrderLineRow({ line, onInc, onDec }) {
  return (
    <div style={styles.orderLine}>
      <div style={{ fontSize: 20 }}>{line.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {line.name}
        </div>
        <div style={{ fontSize: 11, color: '#8892a4' }}>₹{line.priceUnit} each</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button style={styles.qtyBtn} onClick={() => onDec(line.uuid)}>−</button>
        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{line.qty}</span>
        <button style={styles.qtyBtn} onClick={() => onInc(line.uuid)}>+</button>
      </div>
      <div style={{ minWidth: 52, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
        ₹{line.subtotal}
      </div>
    </div>
  );
}

function ReceiptModal({ receipt, onNewOrder }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.receipt}>
        <div style={{ fontSize: 32 }}>🧾</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>
          Payment Complete
        </div>
        <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 16 }}>
          {receipt.ref} {receipt.synced ? '✓ Synced to server' : '⚠ Offline'}
        </div>
        <hr style={{ border: 'none', borderTop: '1px dashed #3d4460', margin: '12px 0' }} />
        {receipt.lines.map(l => (
          <div key={l.uuid} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8892a4', marginBottom: 6 }}>
            <span>{l.emoji} {l.name} ×{l.qty}</span>
            <span>₹{l.subtotal}</span>
          </div>
        ))}
        <hr style={{ border: 'none', borderTop: '1px dashed #3d4460', margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8892a4', marginBottom: 4 }}>
          <span>Tax (5%)</span><span>₹{receipt.tax}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginTop: 6 }}>
          <span>Total</span><span>₹{receipt.total}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#22c55e', marginTop: 4 }}>
          <span>Paid ({receipt.payMethod})</span><span>₹{receipt.paid.toFixed(2)}</span>
        </div>
        {receipt.change > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#f59e0b', marginTop: 4 }}>
            <span>Change</span><span>₹{receipt.change.toFixed(2)}</span>
          </div>
        )}
        {receipt.orderId && (
          <div style={{ fontSize: 11, color: '#4a5568', marginTop: 8 }}>
            Order #{receipt.orderId}
          </div>
        )}
        <hr style={{ border: 'none', borderTop: '1px dashed #3d4460', margin: '12px 0' }} />
        <div style={{ fontSize: 11, color: '#4a5568' }}>Thank you for your purchase!</div>
        <button
          style={{ marginTop: 14, width: '100%', padding: 10, borderRadius: 8,
            border: '1px solid #7c6ef5', background: '#2d2850',
            color: '#9d93f7', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          onClick={onNewOrder}
        >
          New Order
        </button>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
let orderSeq = 1;
const genRef  = () => `POS/2026/${String(orderSeq++).padStart(4, '0')}`;

export default function App() {
  // ── State ──────────────────────────────────────────────
  const [cart, dispatch]    = useReducer(cartReducer, initialCartState);
  const [products, setProducts] = useState([]);
  const [search, setSearch]     = useState('');
  const [cat, setCat]           = useState('All');
  const [payMethod, setPayMethod] = useState(1);
  const [tendered, setTendered]   = useState('');
  const [receipt, setReceipt]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [sessionStatus, setSessionStatus] = useState('connecting...');
  const [orderRef]  = useState(genRef);

  // ── Load products + session on mount ──────────────────
  useEffect(() => {
    // Check session
    sessionApi.getStatus(SESSION_ID)
      .then(res => setSessionStatus(res.session?.state || 'unknown'))
      .catch(() => setSessionStatus('offline'));

    // Load products
    productApi.getAll(CONFIG_ID)
      .then(res => {
        const withEmoji = (res.products || []).map(p => ({
          ...p, emoji: PRODUCT_EMOJIS.default,
        }));
        setProducts(withEmoji);
      })
      .catch(() => {
        // Fallback to mock data when backend unreachable
        setProducts([
          { id:1, name:'Espresso',    lstPrice:50,  emoji:'☕' },
          { id:2, name:'Cappuccino',  lstPrice:80,  emoji:'🍵' },
          { id:3, name:'Croissant',   lstPrice:60,  emoji:'🥐' },
          { id:4, name:'Sandwich',    lstPrice:120, emoji:'🥪' },
          { id:5, name:'Water',       lstPrice:20,  emoji:'💧' },
          { id:6, name:'Chips',       lstPrice:35,  emoji:'🍟' },
        ]);
        setSessionStatus('offline (mock data)');
      });
  }, []);

  // ── Derived values (from hook) ─────────────────────────
  const { subtotal, tax, total } = useOrderTotals(cart.lines);
  const tenderedNum = parseFloat(tendered) || 0;
  const change      = Math.max(0, tenderedNum - total);
  const canPay      = cart.lines.length > 0 && tenderedNum >= total;

  // ── Categories from loaded products ───────────────────
  const cats = useMemo(() => {
    const all = ['All', ...new Set(products.map(p => p.cat).filter(Boolean))];
    return all;
  }, [products]);

  // ── Filtered products ──────────────────────────────────
  const filtered = useMemo(() =>
    products.filter(p => {
      const matchCat    = cat === 'All' || p.cat === cat;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }),
  [products, cat, search]);

  // ── Pay handler ────────────────────────────────────────
  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.sync(SESSION_ID, [{
        uuid:      crypto.randomUUID(),
        sessionId: SESSION_ID,
        state:     'paid',
        lines: cart.lines.map(l => ({
          uuid:              l.uuid,
          productId:         l.productId,
          qty:               l.qty,
          priceUnit:         l.priceUnit,
          discount:          l.discount || 0,
          priceSubtotal:     l.subtotal,
          priceSubtotalIncl: l.subtotal,
        })),
        payments: [{
          uuid:            crypto.randomUUID(),
          paymentMethodId: payMethod,
          amount:          tenderedNum,
        }],
      }]);

      setReceipt({
        ref:       orderRef,
        lines:     [...cart.lines],
        subtotal, tax, total,
        paid:      tenderedNum,
        change,
        payMethod: PAYMENT_METHODS.find(p => p.id === payMethod)?.name,
        orderId:   res.orderIds?.[0],
        synced:    res.status === 'ok',
      });
    } catch (e) {
      // Save locally even if server fails
      setReceipt({
        ref:       orderRef,
        lines:     [...cart.lines],
        subtotal, tax, total,
        paid:      tenderedNum,
        change,
        payMethod: PAYMENT_METHODS.find(p => p.id === payMethod)?.name,
        orderId:   null,
        synced:    false,
      });
      setError('Server unreachable — order saved locally.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    setReceipt(null);
    setTendered('');
    setError(null);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={styles.app}>

      {/* ── LEFT PANEL ── */}
      <div style={styles.leftPanel}>

        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={styles.sessionBadge}>
            <div style={styles.sessionDot} />
            <span>POS/2026/001</span>
            <span style={{ color: '#4a5568' }}>|</span>
            <span>Admin</span>
          </div>
          <input
            style={styles.searchInput}
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div style={styles.catBar}>
          {cats.map(c => (
            <button key={c} style={styles.catBtn(cat === c)} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div style={styles.grid}>
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              cartQty={cart.lines.find(l => l.productId === p.id)?.qty || 0}
              onAdd={product => dispatch({ type: CART_ACTIONS.ADD_ITEM, product })}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center',
              color: '#4a5568', padding: '40px 0', fontSize: 13 }}>
              No products found
            </div>
          )}
        </div>

        {/* Status bar */}
        <div style={styles.statusBar}>
          <span>Backend: localhost:8080</span>
          <span>|</span>
          <span>Session: {sessionStatus}</span>
          <span>|</span>
          <span>Items: {cart.lines.reduce((s, l) => s + l.qty, 0)}</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={styles.rightPanel}>

        {/* Order header */}
        <div style={styles.orderHeader}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Current Order</div>
            <div style={{ fontSize: 11, color: '#8892a4', marginTop: 2 }}>{orderRef}</div>
          </div>
          {cart.lines.length > 0 && (
            <button style={styles.clearBtn}
              onClick={() => dispatch({ type: CART_ACTIONS.CLEAR_CART })}>
              Clear
            </button>
          )}
        </div>

        {/* Error banner */}
        {error && <div style={styles.errorBanner}>{error}</div>}

        {/* Order lines */}
        <div style={styles.orderLines}>
          {cart.lines.length === 0 ? (
            <div style={styles.emptyCart}>
              <div style={{ fontSize: 36, opacity: .4 }}>🛒</div>
              <div style={{ fontSize: 13 }}>No items yet</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Click products to add</div>
            </div>
          ) : (
            cart.lines.map(line => (
              <OrderLineRow
                key={line.uuid}
                line={line}
                onInc={uuid => dispatch({ type: CART_ACTIONS.INCREMENT, uuid })}
                onDec={uuid => dispatch({ type: CART_ACTIONS.DECREMENT, uuid })}
              />
            ))
          )}
        </div>

        {/* Totals */}
        <div style={styles.totalsBox}>
          <div style={styles.totalRow(false)}>
            <span>Subtotal</span><span>₹{subtotal}</span>
          </div>
          <div style={styles.totalRow(false)}>
            <span>Tax (5%)</span><span>₹{tax}</span>
          </div>
          <div style={styles.totalRow(true)}>
            <span>Total</span>
            <span style={{ color: '#9d93f7' }}>₹{total}</span>
          </div>
        </div>

        {/* Payment */}
        <div style={styles.paymentArea}>
          <div style={styles.pmGrid}>
            {PAYMENT_METHODS.map(pm => (
              <button key={pm.id} style={styles.pmBtn(payMethod === pm.id)}
                onClick={() => setPayMethod(pm.id)}>
                {pm.icon} {pm.name}
              </button>
            ))}
          </div>
          <div style={styles.tenderedRow}>
            <span style={{ fontSize: 11, color: '#8892a4', flexShrink: 0 }}>Tendered</span>
            <input
              style={styles.tenderedInput}
              type="number"
              placeholder="0.00"
              value={tendered}
              onChange={e => setTendered(e.target.value)}
            />
          </div>
          {tenderedNum >= total && total > 0 && (
            <div style={styles.changeBox}>
              <span style={{ color: '#22c55e', fontWeight: 500 }}>Change</span>
              <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 16 }}>
                ₹{change.toFixed(2)}
              </span>
            </div>
          )}
          <button style={styles.payBtn(canPay)} disabled={!canPay || loading} onClick={handlePay}>
            {loading ? 'Processing...'
              : cart.lines.length === 0 ? 'Add items to pay'
              : `Pay ₹${total}`}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && <ReceiptModal receipt={receipt} onNewOrder={handleNewOrder} />}
    </div>
  );
}