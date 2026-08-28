import { Eye, ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product, onViewDetails }) {
  const defaultImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  return (
    <div className="product-card">
      <img
        src={product.images && product.images.length > 0 ? product.images[0] : defaultImage}
        alt={product.name}
        className="product-img"
      />
      <div className="product-body">
        <div>
          <span className="product-brand">{product.brand || 'Generic'}</span>
          <h3 className="product-title">{product.name}</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 10px' }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{product.ratings || 0}</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>({product.numReviews || 0})</span>
          </div>
        </div>

        <div>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span className="product-price">₹{product.price}</span>
            <span style={{ fontSize: '12px', color: product.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
              {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => onViewDetails(product)}>
              <Eye size={16} /> View
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={product.stock === 0}>
              <ShoppingCart size={16} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}