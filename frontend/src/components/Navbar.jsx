import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, ShieldCheck, LogIn } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
          <ShoppingBag size={24} color="#1877f2" />
          <span style={{ marginLeft: '8px', fontWeight: 'bold', fontSize: '20px', color: '#1a202c' }}>
            ShopNest
          </span>
        </Link>

        {/* Right Action Links */}
        <div style={styles.menu}>
          <Link to="/" style={styles.link}>Products</Link>

          {isAuthenticated ? (
            <>
              {/* Admin Badge */}
              {isAdmin && (
                <span style={styles.adminBadge}>
                  <ShieldCheck size={14} style={{ marginRight: '4px' }} /> Admin
                </span>
              )}

              {/* User Profile Link */}
              <Link to="/profile" style={styles.userLink}>
                <User size={18} style={{ marginRight: '6px' }} />
                <span>{user?.name}</span>
              </Link>

              {/* Logout Button */}
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
  container: { maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' },
  logo: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
  menu: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#4a5568', textDecoration: 'none', fontWeight: '500' },
  userLink: { display: 'flex', alignItems: 'center', color: '#2d3748', textDecoration: 'none', fontWeight: '600', padding: '6px 12px', background: '#f7fafc', borderRadius: '6px' },
  adminBadge: { display: 'flex', alignItems: 'center', background: '#ebf8ff', color: '#2b6cb0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  logoutBtn: { display: 'flex', alignItems: 'center', background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  loginBtn: { display: 'flex', alignItems: 'center', color: '#1877f2', textDecoration: 'none', fontWeight: '600', padding: '6px 12px' },
  registerBtn: { background: '#1877f2', color: '#ffffff', textDecoration: 'none', fontWeight: '600', padding: '8px 16px', borderRadius: '6px' }
};