import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ebf8ff', color: '#2b6cb0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', marginRight: '16px' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#2d3748' }}>{user?.name}</h2>
            <span style={{ color: '#718096', fontSize: '14px' }}>User Account</span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #edf2f7', margin: '20px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#4a5568' }}>
            <Mail size={18} style={{ marginRight: '12px', color: '#718096' }} />
            <strong>Email:</strong> <span style={{ marginLeft: '8px' }}>{user?.email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', color: '#4a5568' }}>
            <Shield size={18} style={{ marginRight: '12px', color: '#718096' }} />
            <strong>Role:</strong> <span style={{ marginLeft: '8px', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', color: '#38a169', background: '#f0fff4', padding: '12px', borderRadius: '6px' }}>
            <CheckCircle size={18} style={{ marginRight: '10px' }} />
            <span>JWT Session Active & Verified by Backend API</span>
          </div>
        </div>
      </div>
    </div>
  );
}