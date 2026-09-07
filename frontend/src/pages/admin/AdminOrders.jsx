import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/admin/StatusBadge';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, orderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus });
      await loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  if (loading) return <div>⏳ Loading orders...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>Manage Orders</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orders.map((order) => (
          <div key={order._id} style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>#{order._id}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {order.user?.name || 'Customer'} · {order.user?.email || ''}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#2563eb', marginBottom: '6px' }}>₹{order.totalAmount}</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <StatusBadge status={order.paymentStatus} />
                  <StatusBadge status={order.orderStatus} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Update Status:</span>
              <select
                className="form-input"
                style={{ maxWidth: '200px', margin: 0 }}
                value={order.orderStatus}
                onChange={(e) => updateStatus(order._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}