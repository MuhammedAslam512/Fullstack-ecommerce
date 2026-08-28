import { X, Star, ShoppingCart, ShieldCheck } from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const defaultImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} color="#64748b" />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : defaultImage}
            alt={product.name}
            style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '8px' }}
          />

          <div>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>{product.brand}</span>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{product.name}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontWeight: '600' }}>{product.ratings || 0}</span>
            </div>

            <p style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb', marginBottom: '12px' }}>
              ₹{product.price}
            </p>

            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>{product.description}</p>

            <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}