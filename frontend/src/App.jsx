import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

export default function App() {
  return (
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<div style={{ padding: '40px', textAlign: 'center' }}>👨‍💼 Admin Dashboard</div>} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
  );
}

