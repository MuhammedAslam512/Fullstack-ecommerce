import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Reset link sent to your email!');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          <Mail size={22} color="#2563eb" /> Forgot Password
        </h2>
        <p style={styles.subtitle}>
          Enter your email and we’ll send a reset link.
        </p>

        {message && (
          <div style={styles.successBox}>
            <CheckCircle size={16} /> {message}
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/login" style={styles.backLink}>
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
  },
  title: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '22px',
    color: '#0f172a'
  },
  subtitle: {
    margin: '8px 0 18px',
    color: '#64748b',
    fontSize: '14px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    marginBottom: '14px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    background: '#2563eb',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer'
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '12px',
    fontSize: '13px'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '12px',
    fontSize: '13px'
  },
  backLink: {
    marginTop: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600
  }
};