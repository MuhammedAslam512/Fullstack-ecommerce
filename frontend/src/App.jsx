import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './api/axios';

function ConnectionStatus() {
  const { user, isAuthenticated, loading } = useAuth();
  const [apiStatus, setApiStatus] = useState('Connecting to Backend...');

  useEffect(() => {
    api.get('/')
      .then((res) => {
        setApiStatus(`✅ Backend Connected: ${res.data.message}`);
      })
      .catch((err) => {
        setApiStatus(`❌ Backend Connection Failed: ${err.message}`);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading session...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px', maxWidth: '600px', margin: 'auto' }}>
      <h1>🚀 Fullstack Architecture Setup (Day 15)</h1>
      <div style={{ padding: '15px', background: '#f0f4f8', borderRadius: '8px', marginBottom: '20px' }}>
        <strong>Backend Status:</strong>
        <p>{apiStatus}</p>
      </div>

      <div style={{ padding: '15px', background: '#e6fffa', borderRadius: '8px' }}>
        <strong>Auth Context State:</strong>
        <p>Is Authenticated: {isAuthenticated ? 'Yes 🔓' : 'No 🔒'}</p>
        {isAuthenticated && <p>Logged in as: {user.name} ({user.email}) - Role: [{user.role}]</p>}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConnectionStatus />
    </AuthProvider>
  );
}