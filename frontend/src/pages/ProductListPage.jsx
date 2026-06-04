import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../api/axiosClient';
import ProductCard from '../components/ui/ProductCard';
import ProductFilter from '../components/ui/ProductFilter';
import ProductPagination from '../components/ui/ProductPagination';

export default function ProductListPage() {
  const searchParams = new URLSearchParams(window.location.search);

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [locationList, setLocationList] = useState([]);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    priceFrom: searchParams.get('price_from') || '',
    priceTo: searchParams.get('price_to') || '',
    sort: searchParams.get('order') || 'newest',
  });

  const [paginationMeta, setPaginationMeta] = useState({
    currentPage: searchParams.get('page') || 1,
    totalPage: 1,
    perPage: searchParams.get('per_page') || 10,
    totalItems: 0,
  });

const updateUrlParams = (newFilters, page, search) => {
    const params = new URLSearchParams();
    
    if (search.trim()) params.set('search', search.trim());
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.priceFrom) params.set('price_from', newFilters.priceFrom);
    if (newFilters.priceTo) params.set('price_to', newFilters.priceTo);
    if (newFilters.sort) params.set('order', newFilters.sort);
    if (page > 1) params.set('page', page.toString());
    
    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.pushState(null, '', newRelativePathQuery);

    getProducts(params);
  };

  const getProducts = async (params) => {
    try {
      setLoading(true);
      const queryParams = Object.fromEntries(params.entries());
      
      const response = await api.get('/product', { params: queryParams });
      
      setProducts(response.data.data || []);

      setPaginationMeta({
        currentPage: response.data.current_page || 1,
        totalPages: response.data.last_page || 1,
        perPage: response.data.per_page || 10,
        totalItems: response.data.total || 0
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getLocations = async () => {
      try {
        const locations = await api.get('/location');
        setLocationList(locations.data.data || []);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };

    getLocations();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [paginationMeta.currentPage]);

  useEffect(() => {
    getProducts(searchParams);
  }, []);

  const handleFilterChange = (updatedFields) => {
    const nextFilters = { ...filters, ...updatedFields };
    setFilters(nextFilters);
    updateUrlParams(nextFilters, 1, search);
  };

  const handlePageChange = (page) => {
    updateUrlParams(filters, page, search);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams(filters, 1, search);
  };

  const handleClearFilters = () => {
    setSearch('');
    const resetFilters = {
      location: '',
      priceFrom: '',
      priceTo: '',
      sort: 'newest',
    };
    setFilters(resetFilters);
    updateUrlParams(resetFilters, 1, '');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    filters.location !== '' ||
    filters.priceFrom !== '' ||
    filters.priceTo !== '' ||
    filters.sort !== 'newest';

  return (
    <MainLayout>
      <div className="min-h-screen bg-amber-50">
        {/* Banner */}
        <div className="bg-linear-to-r from-amber-600 to-amber-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Cửa Hàng</h1>
            <p className="text-amber-100">Khám phá các sản phẩm thủ công truyền thống từ khắp Việt Nam</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <button 
                type="submit" 
                className="absolute left-4 top-3.5 text-gray-400 hover:text-amber-600 transition-colors"
                title="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm... (Nhấn Enter để tìm)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm group-hover:border-amber-400"
              />
            </form>
          </div>

          <div className="flex gap-8">
            <div className="hidden lg:block w-64">
              <ProductFilter filters={filters} setFilters={handleFilterChange} locationList={locationList} />
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </button>
              )}
          </div>

            {/* Products Section */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
                </button>

                {showFilters && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
                    <ProductFilter filters={filters} setFilters={handleFilterChange} />
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Xóa bộ lọc
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Products Count */}
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">
                  Hiển thị <span className="font-semibold">{products.length}</span> của{' '}
                  <span className="font-semibold">{paginationMeta.totalItems}</span> sản phẩm
                </p>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  <p className="text-gray-600 mt-4">Đang tải sản phẩm...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600">
                  <p>{error}</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp</p>
                </div>
              ) : (
                <>
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {products.map((product) => (
                      <ProductCard key={product.ProductID} product={product} locationList={locationList}/>
                    ))}
                  </div>

                  {/* Pagination */}
                  {paginationMeta.totalPages > 1 && (
                    <ProductPagination
                      currentPage={Number(paginationMeta.currentPage)}
                      totalPages={Number(paginationMeta.totalPages)}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}