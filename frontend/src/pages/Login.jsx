import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate('/profile'); // Redirect on success
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          <LogIn size={24} color="#1877f2" style={{ marginRight: '8px' }} />
          Welcome Back
        </h2>
        <p style={styles.subtitle}>Sign in to your ShopNest account</p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@gmail.com"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '12px' }}>
            <Link
              to="/forgot-password"
              style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' },
  card: { background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' },
  title: { display: 'flex', alignItems: 'center', fontSize: '22px', fontWeight: 'bold', color: '#1a202c', margin: 0 },
  subtitle: { color: '#718096', fontSize: '14px', marginBottom: '24px' },
  errorBox: { display: 'flex', alignItems: 'center', background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fed7d7' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#1877f2', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' },
  footerText: { textAlign: 'center', fontSize: '14px', color: '#718096', marginTop: '20px' },
  link: { color: '#1877f2', textDecoration: 'none', fontWeight: 'bold' }
};

