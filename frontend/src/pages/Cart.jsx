import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>⏳ Loading cart...</div>;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '500px', margin: 'auto' }}>
          <ShoppingBag size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h2>Your cart is empty</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '30px auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShoppingCart size={24} color="#2563eb" /> Shopping Cart
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Left: Items List */}
        <div>
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {cart.items.map((item) => {
              const product = item.product || {};
              const image = product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

              return (
                <div
                  key={product._id || item._id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 120px 100px 40px',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  {/* Product Image */}
                  <img src={image} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />

                  {/* Title & Price */}
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{product.name || 'Product'}</h4>
                    <span style={{ color: '#2563eb', fontWeight: '700' }}>₹{item.price}</span>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px', borderRadius: '6px', width: 'fit-content' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 8px' }}
                      onClick={() => updateQuantity(product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontWeight: '600', fontSize: '14px', width: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 8px' }}
                      onClick={() => updateQuantity(product._id, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ fontWeight: '700', color: '#0f172a', textAlign: 'right' }}>
                    ₹{item.price * item.quantity}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product._id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-outline" onClick={clearCart} style={{ color: '#ef4444', borderColor: '#fecaca' }}>
              Clear Cart
            </button>
            <Link to="/" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
              Order Summary
            </h3>

            <div className="flex-between" style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>₹{cart.totalAmount}</span>
            </div>

            <div className="flex-between" style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
              <span>Shipping</span>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>FREE</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '16px 0' }} />

            <div className="flex-between" style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              <span>Total</span>
              <span style={{ color: '#2563eb' }}>₹{cart.totalAmount}</span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}