  import { useState, useEffect } from 'react';
  import { Plus, Search } from 'lucide-react';
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
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);
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
      ImageURL: null,
    });

    const { sortConfig, requestSort, clearAllSorts } = useTableSort();

    const handleRefresh = () => {
      setSearchInput('');
      setCurrentPage(1);
      clearAllSorts();
      fetchProducts(1, itemPerPage, '', null);
    };

    const fetchProducts = async (page = 1, itemPerPage = 10, search = '', sort = null) => {
      try {
        setLoading(true);
        const params = { page, itemPerPage, search };

        if (sort) {
          params.sortConfigs = JSON.stringify([sort]);
        }

        const response = await api.get('/admin/products', { params });

        if (response.data.success) {
          setProducts(response.data.data.products);
          setTotalPages(response.data.data.totalPages);
          setCurrentPage(page);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        toast.error('Có lỗi xảy ra, vui lòng thử lại');
      } finally {
        setLoading(false);
      }
    };

    const fetchLocation = async () => {
      try {
        const response = await api.get('/location');
        setLocation(response.data.data || response.data);
      } catch (err) {
        toast.error('Có lỗi xảy ra khi tải danh sách địa điểm');
      }
    };

    const fetchCategory = async () => {
      try {
        const response = await api.get('/admin/categories');
        setCategories(response.data.data || response.data);
      } catch (err) {
        toast.error('Có lỗi xảy ra khi tải danh sách danh mục');
      }
    };

    useEffect(() => {
      fetchProducts(1, itemPerPage, '', null);
    }, []);

    useEffect(() => {
      setCurrentPage(1);
      fetchProducts(1, itemPerPage, searchInput, sortConfig);
    }, [sortConfig]);

    const columns = [
      { key: 'image', label: 'Hình ảnh' },
      { key: 'ProductName', label: 'Sản phẩm', sortable: true },
      { key: 'Price', label: 'Giá bán', sortable: true },
      { key: 'Stock', label: 'Tồn kho', sortable: true },
      { key: 'IsActive', label: 'Trạng thái', sortable: true },
      { key: 'actions', label: 'Thao tác' }
    ];

    const handleCreate = () => {
      fetchLocation();
      fetchCategory();
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
      setShowModal(true);
    };

    const handleEdit = (product) => {
      let parsedLocationIDs = [];
      if (product.LocationIDs) {
        if (typeof product.LocationIDs === 'string') {
          parsedLocationIDs = product.LocationIDs.split(',').map(Number);
        } else if (Array.isArray(product.LocationIDs)) {
          parsedLocationIDs = product.LocationIDs.map(Number);
        }
      }
      fetchLocation();
      fetchCategory();
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
      setImagePreview(product.ImageURL);
      setFormErrors({});
      setShowModal(true);
    };

    const handleDeleteClick = (product) => {
      setModalMode('delete');
      setSelectedProduct(product);
      setShowModal(true);
    };

const handleRestore = async (product) => {
      try {
        const response = await api.patch(`/admin/products/${product.ProductID}/toggle-status`);
        
        if (response.data.success) {
          toast.success('Kích hoạt sản phẩm thành công');
          fetchProducts(currentPage, itemPerPage, searchInput, sortConfig);
        }
      } catch (err) {
        toast.error('Có lỗi xảy ra khi kích hoạt sản phẩm');
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
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
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
            toast.success('Tạo sản phẩm thành công');
            fetchProducts(1, itemPerPage, '', sortConfig);
            setShowModal(false);
          }
        } else if (modalMode === 'edit' && selectedProduct) {
          const response = await api.put(`/admin/products/${selectedProduct.ProductID}`, submitData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (response.data.success) {
            toast.success('Cập nhật sản phẩm thành công');
            fetchProducts(currentPage, itemPerPage, searchInput, sortConfig);
            setShowModal(false);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        toast.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    };

    const handleConfirmDelete = async () => {
      try {
        const response = await api.delete(`/admin/products/${selectedProduct.ProductID}`);
        
        if (response.data.success) {
          toast.success('Xóa sản phẩm thành công');
          fetchProducts(currentPage, itemPerPage, searchInput, sortConfig);
          setShowModal(false);
        }
      } catch (err) {
        toast.error('Có lỗi xảy ra khi xóa sản phẩm');
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSearch = () => {
      setCurrentPage(1);
      fetchProducts(1, itemPerPage, searchInput, sortConfig);
    };

    const handleSearchKeyPress = (e) => {
      if (e.key === 'Enter') handleSearch();
    };

    const handlePageChange = (page) => {
      fetchProducts(page, itemPerPage, searchInput, sortConfig);
    };

    const handleItemPerPageChange = (perPage) => {
      setItemPerPage(perPage);
      fetchProducts(1, perPage, searchInput, sortConfig);
    };

    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus size={20} />
              Thêm sản phẩm
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Search size={20} />
              Tìm kiếm
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 bg-white rounded-lg">Đang tải...</div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg p-12 shadow text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg font-medium">Không có sản phẩm</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchInput ? 'Không tìm thấy sản phẩm phù hợp với tìm kiếm của bạn' : 'Hãy thêm sản phẩm đầu tiên'}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Làm mới
              </button>
            </div>
          ) : (
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
          )}

          {!loading && products.length > 0 && totalPages >= 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemPerPage={itemPerPage}
              onPageChange={handlePageChange}
              onItemPerPageChange={handleItemPerPageChange}
            />
          )}
        </div>

        <Modal
          isOpen={showModal}
          title={
            modalMode === 'create'
              ? 'Thêm sản phẩm mới'
              : modalMode === 'delete'
                ? 'Cập nhật sản phẩm'
                : 'Xóa sản phẩm?'
          }
          onClose={() => setShowModal(false)}
          size="lg"
        >
          {modalMode === 'delete' ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct?.ProductName}</strong> không?
              </p>
              <p className="text-orange-600 text-sm">Sản phẩm này sẽ bị chuyển sang trạng thái tắt và ẩn khỏi phía người dùng.</p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500 text-xs">*</span>
                </label>
                <input
                  type="text"
                  name="ProductName"
                  value={formData.ProductName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.ProductName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên sản phẩm"
                />
                {formErrors.ProductName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.ProductName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nguồn gốc <span className="text-red-500 text-xs">*</span>
                </label>
                <select
                  name="OriginLocationID"
                  value={formData.OriginLocationID}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.OriginLocationID ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="" hidden>-- Chọn địa điểm --</option>
                  {location.map((item) => (
                    <option key={`origin-${item.LocationID}`} value={item.LocationID}>
                      {item.LocationName}
                    </option>
                  ))}
                </select>
                {formErrors.OriginLocationID && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.OriginLocationID}</p>
                )}
              </div>

              <div className={`grid grid-cols-2 gap-2 border rounded-lg p-3 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full ${
                formErrors.LocationIDs ? 'border-red-500' : 'border-gray-300'
              }`}>
                <label className="block text-sm font-medium text-gray-700 mb-1 col-span-2 flex justify-between">
                  <span>Cửa hàng phân phối <span className="text-red-500 text-xs">*</span></span>
                  {formErrors.LocationIDs && (
                    <span className="text-red-500 text-xs font-normal">{formErrors.LocationIDs}</span>
                  )}
                </label>
                {location.map((item) => (
                  <label
                    key={`dist-${item.LocationID}`}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={formData.LocationIDs.includes(Number(item.LocationID))}
                      onChange={(e) => {
                        const id = Number(item.LocationID); // Ép kiểu thành số khi thay đổi
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            LocationIDs: [...prev.LocationIDs, id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            LocationIDs: prev.LocationIDs.filter(locId => locId !== id)
                          }));
                        }
                      }}
                    />
                    <span>{item.LocationName}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500 text-xs">*</span>
                </label>
                <select
                  name="CategoryID"
                  value={formData.CategoryID}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.CategoryID ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="" hidden>-- Chọn danh mục --</option>
                  {categories.map((category) => (
                    <option 
                      key={`category-${category.CategoryID}`} 
                      value={category.CategoryID}
                    >
                      {category.CategoryName}
                    </option>
                  ))}
                </select>
                {formErrors.CategoryID && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.CategoryID}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá <span className="text-red-500 text-xs">*</span>
                </label>
                <input
                  type="number"
                  name="Price"
                  value={formData.Price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.Price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {formErrors.Price && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.Price}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng <span className="text-red-500 text-xs">*</span>
                  </label>
                  <input
                    type="number"
                    name="Stock"
                    value={formData.Stock}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.Stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {formErrors.Stock && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.Stock}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trọng lượng (g) <span className="text-red-500 text-xs">*</span>
                  </label>
                  <input
                    type="number"
                    name="Weight"
                    value={formData.Weight}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.Weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {formErrors.Weight && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.Weight}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh sản phẩm (Thumbnail)
                </label>
                <div className="flex items-start gap-4">
                  {imagePreview && (
                    <ImageDisplay
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 mt-1"
                    />
                  )}
                  <div className="flex-1 w-full overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 ${
                        formErrors.image ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.image && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {modalMode === 'create' ? 'Tạo' : 'Cập nhật'}
                </button>
              </div>

            </form>
          )}
        </Modal>
      </MainLayout>
    );
  }