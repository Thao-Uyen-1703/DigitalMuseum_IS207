import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/MainLayout';
import DataTable from '../../components/table/DataTable';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import useTableSort from '../../components/hooks/useTableSort';
import api from '../../api/axiosClient';
import ProductTableRow from '../../components/table/ProductTableRow';
import ImageDisplay from '../../components/common/ImageDisplay';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  
  const [searchInput, setSearchInput] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalError, setModalError] = useState('');
  
  const [location, setLocation] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    ProductName: '',
    CategoryID: '',
    OriginLocationID: '',
    LocationIDs: [],
    Price: '',
    Stock: 0,
    Weight: '',
  });

  const { sortConfig, requestSort, clearAllSorts } = useTableSort();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchProducts = async (
    page = currentPage, 
    currentSearch = searchInput, 
    currentStatus = filterStatus, 
    currentStock = filterStock,
    currentCategory = filterCategory,
    currentLocation = filterLocation
  ) => {
    try {
      setLoading(true);
      const params = { page, perPage: itemPerPage };
      
      if (currentSearch) params.search = currentSearch;
      if (currentStatus !== '') params.status = currentStatus;
      if (currentStock !== '') params.stock = currentStock;
      if (currentCategory !== '') params.category = currentCategory;
      if (currentLocation !== '') params.location = currentLocation;
      if (sortConfig) params.sortConfigs = JSON.stringify([sortConfig]);

      const response = await api.get('/admin/products', { params });

      if (response.data.success) {
        setProducts(response.data.data.products || []);
        setTotalPages(response.data.data.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationAndCategory = async () => {
    try {
      const [locRes, catRes] = await Promise.all([
        api.get('/location'),
        api.get('/admin/categories')
      ]);
      setLocation(locRes.data.data || locRes.data || []);
      setCategories(catRes.data.data.categories || catRes.data.data || []);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tải dữ liệu phụ trợ');
    }
  };

  useEffect(() => {
    fetchLocationAndCategory();
    fetchProducts(1, '', '', '', '', '');
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1, searchInput, filterStatus, filterStock, filterCategory, filterLocation);
  }, [itemPerPage, sortConfig, filterStatus, filterStock, filterCategory, filterLocation, refreshTrigger]);

  const handleRefresh = () => {
  setSearchInput('');
  setFilterStatus('');
  setFilterStock('');
  setFilterCategory('');
  setFilterLocation('');
  clearAllSorts();
  setCurrentPage(1);
  setRefreshTrigger(prev => prev + 1); 
};

  const columns = [
    { key: 'image', label: 'Hình ảnh', sortable: false },
    { key: 'ProductName', label: 'Sản phẩm', sortable: true },
    { key: 'CategoryName', label: 'Danh mục', sortable: false },
    { key: 'Price', label: 'Giá bán', sortable: true },
    { key: 'Stock', label: 'Tồn kho', sortable: true },
    { key: 'IsActive', label: 'Trạng thái', sortable: true },
    { key: 'actions', label: 'Thao tác', sortable: false }
  ];

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      ProductName: '',
      CategoryID: '',
      OriginLocationID: '',
      LocationIDs: [],
      Price: '',
      Stock: '',
      Weight: '',
    });
    setSelectedProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setFormErrors({});
    setModalError('');
    setShowModal(true);
  };

  const handleEdit = (product) => {
    let parsedLocationIDs = [];
    if (product.LocationIDs) {
      parsedLocationIDs = typeof product.LocationIDs === 'string' 
        ? product.LocationIDs.split(',').map(Number)
        : Array.isArray(product.LocationIDs) ? product.LocationIDs.map(Number) : [];
    }
    
    setModalMode('edit');
    setFormData({
      ProductName: product.ProductName ?? '',
      CategoryID: product.CategoryID ?? '',
      OriginLocationID: product.OriginLocationID ?? '',
      LocationIDs: parsedLocationIDs,
      Price: product.Price ?? '',
      Stock: product.Stock ?? '',
      Weight: product.Weight ?? ''
    });
    setSelectedProduct(product);
    setImageFile(null);
    setImagePreview(product.ImageURL || null);
    setFormErrors({});
    setModalError('');
    setShowModal(true);
  };

  const handleDeleteClick = (product) => {
    setModalMode('delete');
    setSelectedProduct(product);
    setModalError('');
    setShowModal(true);
  };

  const handleRestore = async (product) => {
    try {
      const response = await api.patch(`/admin/products/${product.ProductID}/toggle-status`);
      if (response.data.success) {
        toast.success(response.data.message || 'Kích hoạt sản phẩm thành công');
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi kích hoạt sản phẩm');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, image: 'Kích thước ảnh vượt quá giới hạn 25MB.' }));
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormErrors(prev => ({ ...prev, image: 'Chỉ chấp nhận ảnh PNG, JPG, JPEG.' }));
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    
    if (formErrors.image) {
      setFormErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'LocationIDs') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (modalMode === 'create') {
        const response = await api.post('/admin/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success(response.data.message || 'Tạo sản phẩm thành công');
          fetchProducts(1);
          setShowModal(false);
        } else {
          setModalError(response.data.message || 'Thêm sản phẩm thất bại');
        }
      } else if (modalMode === 'edit' && selectedProduct) {
        const response = await api.put(`/admin/products/${selectedProduct.ProductID}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success(response.data.message || 'Cập nhật sản phẩm thành công');
          fetchProducts();
          setShowModal(false);
        } else {
          setModalError(response.data.message || 'Cập nhật sản phẩm thất bại');
        }
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.');
    }
  };

  const handleConfirmDelete = async () => {
    setModalError('');
    try {
      const response = await api.delete(`/admin/products/${selectedProduct.ProductID}`);
      if (response.data.success) {
        toast.success(response.data.message || 'Ngừng hoạt động sản phẩm thành công');
        fetchProducts();
        setShowModal(false);
      } else {
        setModalError(response.data.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-sm text-gray-500">Tạo, cập nhật và quản lý kho hàng, sản phẩm.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#2C4C3E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#264033] transition"
          >
            <Plus size={18} /> Thêm sản phẩm
          </button>
        </div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-1 w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-[#2C4C3E] focus-within:ring-1 focus-within:ring-[#2C4C3E] transition">
              <Search size={18} className="text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSearch}
                className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl bg-[#2C4C3E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#264033] transition"
              >
                Tìm kiếm
              </button>
              <button
                onClick={handleRefresh}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition hover:cursor-pointer hover:bg-gray-300"
              >
                <RefreshCcw size={18} /> Làm mới
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Danh mục:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-40 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#2C4C3E] focus:ring-1 focus:ring-[#2C4C3E] transition cursor-pointer"
              >
                <option value="">Tất cả</option>
                {categories.map((category) => (
                  <option key={`cat-filter-${category.CategoryID}`} value={category.CategoryID}>
                    {category.CategoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Nguồn gốc:
              </label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full sm:w-40 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#2C4C3E] focus:ring-1 focus:ring-[#2C4C3E] transition cursor-pointer"
              >
                <option value="">Tất cả</option>
                {location.map((loc) => (
                  <option key={`loc-filter-${loc.LocationID}`} value={loc.LocationID}>
                    {loc.LocationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Trạng thái:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-40 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#2C4C3E] focus:ring-1 focus:ring-[#2C4C3E] transition cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Đã ẩn</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Tồn kho:
              </label>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full sm:w-40 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#2C4C3E] focus:ring-1 focus:ring-[#2C4C3E] transition cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="in_stock">Còn hàng</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Không có sản phẩm</p>
            <p className="text-gray-400 text-sm mt-2">
              Hãy thay đổi bộ lọc hoặc thêm sản phẩm đầu tiên.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <DataTable
              columns={columns}
              data={products}
              sortConfig={sortConfig}
              onSort={requestSort}
              renderRow={(product, index) => (
                <ProductTableRow 
                  key={`${product.ProductID}-${index}`}
                  product={product} 
                  onEdit={handleEdit} 
                  onDelete={handleDeleteClick}
                  onRestore={() => handleRestore(product)}
                />
              )}
            />
          </div>
        )}

        {!loading && products.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemPerPage={itemPerPage}
            onPageChange={(page) => fetchProducts(page)}
            onItemPerPageChange={(perPage) => {
              setItemPerPage(perPage);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={
          modalMode === 'create'
            ? 'Thêm sản phẩm mới'
            : modalMode === 'delete'
              ? 'Ngừng hoạt động sản phẩm?'
              : 'Cập nhật sản phẩm'
        }
        onClose={() => setShowModal(false)}
        size="lg"
      >
        {modalMode === 'delete' ? (
          <div className="space-y-6">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn ngừng kinh doanh sản phẩm <strong>{selectedProduct?.ProductName}</strong> không?
            </p>
            <p className="text-orange-600 text-sm bg-orange-50 p-3 rounded-lg border border-orange-100">
              Sản phẩm này sẽ bị chuyển sang trạng thái <strong>Đã ẩn</strong> và không còn hiển thị với người dùng. Bạn vẫn có thể kích hoạt lại sau.
            </p>

            {modalError && (
              <div className="text-red-500 text-sm font-medium text-center">
                {modalError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition"
              >
                Ngừng kinh doanh
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ProductName"
                value={formData.ProductName}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] focus:border-transparent transition ${
                  formErrors.ProductName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Nhập tên sản phẩm"
              />
              {formErrors.ProductName && <p className="text-red-500 text-xs mt-1.5">{formErrors.ProductName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="CategoryID"
                  value={formData.CategoryID}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] transition bg-white ${
                    formErrors.CategoryID ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="" hidden>-- Chọn danh mục --</option>
                  {categories.map((category) => (
                    <option key={`category-${category.CategoryID}`} value={category.CategoryID}>
                      {category.CategoryName}
                    </option>
                  ))}
                </select>
                {formErrors.CategoryID && <p className="text-red-500 text-xs mt-1.5">{formErrors.CategoryID}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nguồn gốc <span className="text-red-500">*</span>
                </label>
                <select
                  name="OriginLocationID"
                  value={formData.OriginLocationID}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] transition bg-white ${
                    formErrors.OriginLocationID ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="" hidden>-- Chọn địa điểm --</option>
                  {location.map((item) => (
                    <option key={`origin-${item.LocationID}`} value={item.LocationID}>
                      {item.LocationName}
                    </option>
                  ))}
                </select>
                {formErrors.OriginLocationID && <p className="text-red-500 text-xs mt-1.5">{formErrors.OriginLocationID}</p>}
              </div>
            </div>

            <div className={`border rounded-xl p-4 bg-gray-50/50 ${
              formErrors.LocationIDs ? 'border-red-500' : 'border-gray-200'
            }`}>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex justify-between">
                <span>Cửa hàng phân phối <span className="text-red-500">*</span></span>
                {formErrors.LocationIDs && (
                  <span className="text-red-500 text-xs font-normal">{formErrors.LocationIDs}</span>
                )}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {location.map((item) => (
                  <label
                    key={`dist-${item.LocationID}`}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#2C4C3E] focus:ring-[#2C4C3E]"
                      checked={formData.LocationIDs.includes(Number(item.LocationID))}
                      onChange={(e) => {
                        const id = Number(item.LocationID);
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, LocationIDs: [...prev.LocationIDs, id] }));
                        } else {
                          setFormData(prev => ({ ...prev, LocationIDs: prev.LocationIDs.filter(locId => locId !== id) }));
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700 truncate">{item.LocationName}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="Price"
                  value={formData.Price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] transition"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tồn kho <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="Stock"
                  value={formData.Stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] transition"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Trọng lượng (g) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="Weight"
                  value={formData.Weight}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] transition"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh sản phẩm (Thumbnail)
              </label>
              <div className="border-2 border-dashed border-gray-200 hover:border-[#2C4C3E] rounded-xl p-4 transition-all bg-gray-50/50">
                <div className="flex flex-col md:flex-row items-center gap-5">
                  <div className="shrink-0">
                    {imagePreview ? (
                      <ImageDisplay
                        src={imagePreview}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 text-sm shadow-sm">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col items-center">
                    <input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <label
                      htmlFor="thumbnail-upload"
                      className="cursor-pointer flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-[#2C4C3E] hover:border-[#2C4C3E] transition shadow-sm"
                    >
                      Chọn ảnh tải lên
                    </label>

                    <p className="mt-3 text-xs text-gray-500 text-center">
                      Hỗ trợ định dạng: JPG, PNG, WEBP. Dung lượng tối đa 25MB.
                    </p>
                    {formErrors.image && <p className="text-red-500 text-xs mt-1.5">{formErrors.image}</p>}
                  </div>
                </div>
              </div>
            </div>

            {modalError && (
              <div className="text-red-500 text-sm font-medium text-center pt-2">
                {modalError}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#2C4C3E] text-white font-medium rounded-xl hover:bg-[#264033] transition"
              >
                {modalMode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </MainLayout>
  );
}