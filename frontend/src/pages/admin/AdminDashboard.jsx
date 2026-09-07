import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/admin/StatsCard';
import { Package, ShoppingBag, Users, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/orders')
        ]);

        const orders = ordersRes.data?.data || [];
        const revenue = orders
          .filter((o) => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        setStats({
          products: productsRes.data?.pagination?.totalProducts || productsRes.data?.count || 0,
          orders: orders.length,
          users: 0, // optional if you add users endpoint later
          revenue
        });
      } catch (err) {
        console.error('Failed loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div>⏳ Loading dashboard...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>Dashboard Overview</h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>Manage your store performance and operations.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <StatsCard title="Total Products" value={stats.products} icon={<Package size={20} />} color="#2563eb" />
        <StatsCard title="Total Orders" value={stats.orders} icon={<ShoppingBag size={20} />} color="#7c3aed" />
        <StatsCard title="Paid Revenue" value={`₹${stats.revenue}`} icon={<IndianRupee size={20} />} color="#16a34a" />
        <StatsCard title="Users" value={stats.users || '—'} icon={<Users size={20} />} color="#ea580c" />
      </div>
    </div>
  );
}