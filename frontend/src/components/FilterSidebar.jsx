import { Search, Filter, RotateCcw } from 'lucide-react';

export default function FilterSidebar({ filters, setFilters, categories, onReset }) {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  return (
    <div className="sidebar">
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <h3 className="sidebar-title" style={{ margin: 0, border: 'none', padding: 0 }}>
          <Filter size={18} style={{ marginRight: '6px' }} /> Filters
        </h3>
        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={onReset}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Search</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search products..."
            className="form-input"
            style={{ paddingLeft: '32px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
        </div>
      </div>

      {/* Category Dropdown */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Category</label>
        <select name="category" value={filters.category} onChange={handleChange} className="form-input">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Price Range (₹)</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="Min"
            className="form-input"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="Max"
            className="form-input"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Sort By</label>
        <select name="sort" value={filters.sort} onChange={handleChange} className="form-input">
          <option value="-createdAt">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}