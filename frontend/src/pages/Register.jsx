import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(formData);
      navigate('/profile'); // Redirect on success
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try another email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          <UserPlus size={24} color="#1877f2" style={{ marginRight: '8px' }} />
          Create Account
        </h2>
        <p style={styles.subtitle}>Join ShopNest today</p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@gmail.com"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
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