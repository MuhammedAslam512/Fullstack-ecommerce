import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ⚡ 1. CATCH OAUTH TOKEN FROM URL QUERY PARAMETERS (?token=eyJhbG...)
  useEffect(() => {
    const oauthToken = searchParams.get('token');
    if (oauthToken) {
      localStorage.setItem('token', oauthToken);
      // Reload page to initialize session from token
      window.location.href = '/profile';
    }
  }, [searchParams]);

  // ⚡ 2. REDIRECT TO BACKEND GOOGLE OAUTH ENDPOINT
  const handleGoogleLogin = () => {
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    window.location.href = `${backendBaseUrl}/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate('/profile');
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
        <p style={styles.subtitle}>Sign in to your Donglify account</p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        {/* ⚡ GOOGLE OAUTH BUTTON */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={styles.googleBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        {/* Regular Email & Password Form */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
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
  subtitle: { color: '#718096', fontSize: '14px', marginBottom: '20px' },
  errorBox: { display: 'flex', alignItems: 'center', background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fed7d7' },
  googleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', background: '#ffffff', color: '#3c4043', border: '1px solid #dadce0', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginBottom: '20px', transition: 'background 0.2s' },
  divider: { display: 'flex', alignItems: 'center', textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', lineHeight: '0.1em' },
  dividerText: { background: '#fff', padding: '0 10px', color: '#a0aec0', fontSize: '12px', fontWeight: 'bold' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568' },
  forgotLink: { color: '#1877f2', fontSize: '12px', fontWeight: '600', textDecoration: 'none' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#1877f2', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' },
  footerText: { textAlign: 'center', fontSize: '14px', color: '#718096', marginTop: '20px' },
  link: { color: '#1877f2', textDecoration: 'none', fontWeight: 'bold' }
};

