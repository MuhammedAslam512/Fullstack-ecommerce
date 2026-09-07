import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  console.log('🛡️ AdminRoute:', {
    loading,
    isAuthenticated,
    isAdmin,
    role: user?.role
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
        ⏳ Verifying admin privileges...
      </div>
    );
  }

  // Must be logged in AND admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}