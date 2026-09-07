import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Users,
  ArrowLeft
} from 'lucide-react';

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Checking admin access...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: isActive ? '#1d4ed8' : '#334155',
    background: isActive ? '#eff6ff' : 'transparent',
    fontWeight: 600,
    fontSize: '14px'
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside style={{
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        padding: '20px 14px'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#0f172a' }}>👨‍💼 Admin Panel</h3>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <NavLink to="/admin" end style={linkStyle}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" style={linkStyle}>
            <Package size={16} /> Products
          </NavLink>
          <NavLink to="/admin/orders" style={linkStyle}>
            <ShoppingBag size={16} /> Orders
          </NavLink>
          <NavLink to="/admin/categories" style={linkStyle}>
            <Tags size={16} /> Categories
          </NavLink>
          <NavLink to="/admin/users" style={linkStyle}>
            <Users size={16} /> Users
          </NavLink>
        </nav>

        <div style={{ marginTop: '24px' }}>
          <NavLink to="/" style={linkStyle}>
            <ArrowLeft size={16} /> Back to Store
          </NavLink>
        </div>
      </aside>

      {/* Content */}
      <main style={{ padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}