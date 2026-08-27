import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
        ⏳ Verifying session...
      </div>
    );
  }

  // If user is logged in, show child component (<Outlet />), otherwise redirect to /login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}