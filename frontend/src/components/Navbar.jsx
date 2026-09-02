import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, User, LogOut, ShieldCheck, LogIn, Package } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Brand Logo */}
        <Link to="/" style={styles.logo}>
          <ShoppingBag size={24} color="#2563eb" />
          <span style={{ marginLeft: '8px', fontWeight: 'bold', fontSize: '20px', color: '#0f172a' }}>
            ShopNest
          </span>
        </Link>

        {/* Right Action Links */}
        <div style={styles.menu}>
          <Link to="/" style={styles.link}>Products</Link>

          {/* Cart Icon Link */}
          <Link to="/cart" style={styles.cartLink}>
            <ShoppingCart size={20} color="#334155" />
            {totalItemCount > 0 && (
              <span style={styles.cartBadge}>{totalItemCount}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <span style={styles.adminBadge}>
                  <ShieldCheck size={14} style={{ marginRight: '4px' }} /> Admin
                </span>
              )}
              <Link to="/my-orders" style={styles.link} title="Order History">
                <Package size={18} style={{ marginRight: '4px' }} /> Orders
              </Link>

              <Link to="/profile" style={styles.userLink}>
                <User size={18} style={{ marginRight: '6px' }} />
                <span>{user?.name}</span>
              </Link>

              <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={16} style={{ marginRight: '6px' }} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>
                <LogIn size={16} style={{ marginRight: '6px' }} /> Login
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' },
  logo: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
  menu: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#475569', textDecoration: 'none', fontWeight: '500' },
  cartLink: { position: 'relative', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '6px', textDecoration: 'none' },
  cartBadge: { position: 'absolute', top: '-2px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' },
  userLink: { display: 'flex', alignItems: 'center', color: '#1e293b', textDecoration: 'none', fontWeight: '600', padding: '6px 12px', background: '#f1f5f9', borderRadius: '6px' },
  adminBadge: { display: 'flex', alignItems: 'center', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  logoutBtn: { display: 'flex', alignItems: 'center', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  loginBtn: { display: 'flex', alignItems: 'center', color: '#2563eb', textDecoration: 'none', fontWeight: '600', padding: '6px 12px' },
  registerBtn: { background: '#2563eb', color: '#ffffff', textDecoration: 'none', fontWeight: '600', padding: '8px 16px', borderRadius: '6px' }
};