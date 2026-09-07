import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <div>⏳ Loading users...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '12px' }}>Manage Users</h2>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {!error && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>{u.name}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <select
                      className="form-input"
                      style={{ margin: 0, maxWidth: '140px' }}
                      value={u.role}
                      onChange={(e) => updateRole(u._id, e.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      className="btn btn-outline"
                      style={{ color: '#dc2626' }}
                      onClick={() => deleteUser(u._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}