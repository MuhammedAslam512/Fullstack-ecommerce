import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  brand: '',
  category: ''
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories')
      ]);
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock)
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      brand: product.brand || '',
      category: product.category?._id || product.category || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>Manage Products</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <input className="form-input" name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
        <input className="form-input" name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
        <input className="form-input" name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input className="form-input" name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <select className="form-input" name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input className="form-input" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            <Plus size={16} /> {editingId ? (saving ? 'Updating...' : 'Update Product') : (saving ? 'Creating...' : 'Create Product')}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      {loading ? (
        <div>⏳ Loading products...</div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={th}>Name</th>
                <th style={th}>Brand</th>
                <th style={th}>Price</th>
                <th style={th}>Stock</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.brand || '—'}</td>
                  <td style={td}>₹{p.price}</td>
                  <td style={td}>{p.stock}</td>
                  <td style={td}>
                    <button className="btn btn-outline" style={{ marginRight: '8px', padding: '6px 10px' }} onClick={() => handleEdit(p)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px 10px', color: '#dc2626' }} onClick={() => handleDelete(p._id)}>
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

const th = { padding: '12px', fontSize: '13px', color: '#64748b' };
const td = { padding: '12px', fontSize: '14px', color: '#0f172a' };