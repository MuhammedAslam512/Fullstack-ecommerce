import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, X, Loader2 } from 'lucide-react';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ⚡ DEBOUNCED AUTO-COMPLETE API CALL (300ms Delay)
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/autocomplete?q=${encodeURIComponent(searchTerm)}`);
        if (res.data.success) {
          setSuggestions(res.data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms Debounce Delay

    return () => clearTimeout(timer); // Clear timeout if user types again quickly
  }, [searchTerm]);

  const handleSelectSuggestion = (product) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate(`/?search=${encodeURIComponent(product.name)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
      <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products, brands..."
          className="form-input"
          style={{
            margin: 0,
            paddingLeft: '36px',
            paddingRight: '30px',
            borderRadius: '20px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc'
          }}
        />
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />

        {loading ? (
          <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '12px', color: '#2563eb' }} />
        ) : searchTerm ? (
          <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748b', cursor: 'pointer' }} />
        ) : null}
      </form>

      {/* Instant Dropdown Suggestions Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '42px',
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          {suggestions.length === 0 ? (
            <div style={{ padding: '12px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
              No matching products found
            </div>
          ) : (
            suggestions.map((product) => (
              <div
                key={product._id}
                onClick={() => handleSelectSuggestion(product)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <img
                  src={product.images && product.images.length > 0 ? product.images[0] : defaultImage}
                  alt={product.name}
                  style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{product.brand}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>
                  ₹{product.price}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}