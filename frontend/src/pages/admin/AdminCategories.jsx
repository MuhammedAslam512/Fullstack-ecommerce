import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name, description });
      setName('');
      setDescription('');
      await loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      await loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>Manage Categories</h2>

      <form onSubmit={handleCreate} style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        display: 'grid',
        gap: '10px',
        maxWidth: '520px'
      }}>
        <input className="form-input" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="form-input" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn btn-primary" type="submit">
          <Plus size={16} /> Add Category
        </button>
      </form>

      {loading ? (
        <div>⏳ Loading...</div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {categories.map((c) => (
            <div key={c._id} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{c.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{c.description || 'No description'}</div>
              </div>
              <button className="btn btn-outline" style={{ color: '#dc2626' }} onClick={() => handleDelete(c._id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}