import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="container" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CheckCircle size={64} color="#16a34a" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
          Order Confirmed! 🎉
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Thank you for your purchase. We have received your order and are processing it.
        </p>

        {order && (
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
            <div className="flex-between" style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>Order ID:</strong> <span>#{order._id}</span>
            </div>
            <div className="flex-between" style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>Total Amount:</strong> <span style={{ color: '#2563eb', fontWeight: '700' }}>₹{order.totalAmount}</span>
            </div>
            <div className="flex-between" style={{ fontSize: '14px' }}>
              <strong>Payment Status:</strong> <span style={{ color: '#16a34a', fontWeight: '600' }}>Paid ✅</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}