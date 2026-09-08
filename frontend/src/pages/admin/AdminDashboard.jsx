import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/admin/StatsCard';
import SalesChart from '../../components/admin/SalesChart';
import { Package, ShoppingBag, Users, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [analyticsRes, productsRes, usersRes] = await Promise.allSettled([
          api.get('/orders/analytics'),
          api.get('/products?limit=1'),
          api.get('/users')
        ]);

        let totalRev = 0;
        let totalOrd = 0;
        let cData = [];

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
          const { summary, chartData: trends } = analyticsRes.value.data;
          totalRev = summary.totalRevenue || 0;
          totalOrd = summary.totalOrders || 0;
          cData = trends || [];
        }

        const totalProd = productsRes.status === 'fulfilled'
          ? (productsRes.value.data?.pagination?.totalProducts || productsRes.value.data?.count || 0)
          : 0;

        const totalUsr = usersRes.status === 'fulfilled'
          ? (usersRes.value.data?.count || usersRes.value.data?.data?.length || 0)
          : 0;

        setStats({
          products: totalProd,
          orders: totalOrd,
          users: totalUsr,
          revenue: totalRev
        });

        setChartData(cData);
      } catch (err) {
        console.error('Failed loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>⏳ Loading live analytics...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>Dashboard Analytics</h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>Real-time store metrics and 30-day performance trends.</p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatsCard title="Total Revenue" value={`₹${stats.revenue}`} icon={<IndianRupee size={20} />} color="#16a34a" />
        <StatsCard title="Total Orders" value={stats.orders} icon={<ShoppingBag size={20} />} color="#7c3aed" />
        <StatsCard title="Total Products" value={stats.products} icon={<Package size={20} />} color="#2563eb" />
        <StatsCard title="Total Users" value={stats.users} icon={<Users size={20} />} color="#ea580c" />
      </div>

      {/* Visual Analytics Charts */}
      <SalesChart data={chartData} />
    </div>
  );
}


// import { useEffect, useState } from 'react';
// import api from '../../api/axios';
// import StatsCard from '../../components/admin/StatsCard';
// import { Package, ShoppingBag, Users, IndianRupee } from 'lucide-react';

// export default function AdminDashboard() {
//   const [stats, setStats] = useState({
//     products: 0,
//     orders: 0,
//     users: 0,
//     revenue: 0
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadStats = async () => {
//       try {
//         const [productsRes, ordersRes] = await Promise.all([
//           api.get('/products?limit=1'),
//           api.get('/orders')
//         ]);

//         const orders = ordersRes.data?.data || [];
//         const revenue = orders
//           .filter((o) => o.paymentStatus === 'paid')
//           .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

//         setStats({
//           products: productsRes.data?.pagination?.totalProducts || productsRes.data?.count || 0,
//           orders: orders.length,
//           users: 0, // optional if you add users endpoint later
//           revenue
//         });
//       } catch (err) {
//         console.error('Failed loading admin stats:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStats();
//   }, []);

//   if (loading) return <div>⏳ Loading dashboard...</div>;

//   return (
//     <div>
//       <h2 style={{ marginBottom: '8px' }}>Dashboard Overview</h2>
//       <p style={{ color: '#64748b', marginBottom: '20px' }}>Manage your store performance and operations.</p>

//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
//         gap: '16px'
//       }}>
//         <StatsCard title="Total Products" value={stats.products} icon={<Package size={20} />} color="#2563eb" />
//         <StatsCard title="Total Orders" value={stats.orders} icon={<ShoppingBag size={20} />} color="#7c3aed" />
//         <StatsCard title="Paid Revenue" value={`₹${stats.revenue}`} icon={<IndianRupee size={20} />} color="#16a34a" />
//         <StatsCard title="Users" value={stats.users || '—'} icon={<Users size={20} />} color="#ea580c" />
//       </div>
//     </div>
//   );
// }

