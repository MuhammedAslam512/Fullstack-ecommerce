import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import ProductDetailModal from '../components/ProductDetailModal';
import { PackageX } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const initialFilters = {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    page: 1,
    limit: 8
  };

  const [filters, setFilters] = useState(initialFilters);
  
  // Load Categories once on mount
  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Load Products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query string
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);
        params.append('page', filters.page);
        params.append('limit', filters.limit);

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleReset = () => setFilters(initialFilters);
  const handlePageChange = (newPage) => setFilters({ ...filters, page: newPage });

  return (
    <div className="container">
      <div className="grid-catalog">
        {/* Left Sidebar */}
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          onReset={handleReset}
        />

        {/* Right Catalog */}
        <div>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Product Catalog</h2>
            {pagination && (
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Showing {products.length} of {pagination.totalProducts} products
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              ⏳ Loading products...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <PackageX size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h3>No products found</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Try resetting your filters or search keywords.</p>
            </div>
          ) : (
            <>
              <div className="grid-products">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
  
}


