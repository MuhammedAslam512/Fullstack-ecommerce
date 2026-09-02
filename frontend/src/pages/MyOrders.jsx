import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Delivered</span>;
      case 'shipped':
        return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Truck size={14} /> Shipped</span>;
      case 'processing':
        return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Processing</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14} /> Pending</span>;
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>⏳ Loading your order history...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '500px', margin: 'auto' }}>
          <Package size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h2>No orders placed yet</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>When you place orders, they will appear here with live tracking status.</p>
          <Link to="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '30px auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Package size={24} color="#2563eb" /> My Orders History ({orders.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.map((order) => (
          <div key={order._id} style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div className="flex-between" style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Order ID: #{order._id}</span>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Placed on: {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getStatusBadge(order.orderStatus)}
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex-between" style={{ fontSize: '14px' }}>
                  <span>{item.name || 'Product'} × {item.quantity}</span>
                  <span style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}