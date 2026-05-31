import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/MainLayout';
import DataTable from '../../components/table/DataTable';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import useTableSort from '../../components/hooks/useTableSort';
import api from '../../api/axiosClient';
import CategoryTableRow from '../../components/table/CategoryTableRow';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    CategoryName: '',
    Description: ''
  });

  const { sortConfig, requestSort, clearAllSorts } = useTableSort();

  const handleRefresh = () => {
    setSearchInput('');
    setCurrentPage(1);
    clearAllSorts();
    fetchCategories();
  };

  const fetchCategories = async (page = currentPage) => {
    try {
      setLoading(true);
      const params = { page, perPage: itemPerPage };
      if (searchInput) params.search = searchInput;
      if (sortConfig) params.sortConfigs = JSON.stringify([sortConfig]);

      const response = await api.get('/admin/categories', { params });
      if (response.data.success) {
        const data = response.data.data || {};
        setCategories(data.categories || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchCategories(1);
  }, [searchInput, itemPerPage, sortConfig]);
  // server returns paginated list in `categories`
  const paged = categories;

  const columns = [
    { key: 'CategoryName', label: 'Danh mục', sortable: true },
    { key: 'Description', label: 'Mô tả' },
    { key: 'ProductCount', label: 'Số lượng sản phẩm', sortable: true },
    { key: 'actions', label: 'Thao tác' }
  ];

  const handleCreate = () => {
    setModalMode('create');
    setFormData({ CategoryName: '', Description: '' });
    setSelectedCategory(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setModalMode('edit');
    setFormData({
      CategoryName: category.CategoryName ?? '',
      Description: category.Description ?? ''
    });
    setSelectedCategory(category);
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteClick = (category) => {
    setModalMode('delete');
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const response = await api.post('/admin/categories', formData);
        if (response.data.success) {
          toast.success('Tạo danh mục thành công');
          fetchCategories();
          setShowModal(false);
        }
      } else if (modalMode === 'edit' && selectedCategory) {
        const response = await api.put(`/admin/categories/${selectedCategory.CategoryID}`, formData);
        if (response.data.success) {
          toast.success('Cập nhật danh mục thành công');
          fetchCategories();
          setShowModal(false);
        }
      }
    } catch (err) {
      toast.error(err.response.data.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await api.delete(`/admin/categories/${selectedCategory.CategoryID}`);
      if (response.data.success) {
        toast.success('Xóa danh mục thành công');
        fetchCategories();
        setShowModal(false);
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories(1);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePageChange = (page) => {
    fetchCategories(page);
  };

  const handleItemPerPageChange = (perPage) => {
    setItemPerPage(perPage);
    setCurrentPage(1);
    fetchCategories(1);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            Thêm danh mục
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
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

        {loading ? (
          <div className="text-center py-8 bg-white rounded-lg">Đang tải...</div>
        ) : paged.length === 0 ? (
          <div className="bg-white rounded-lg p-12 shadow text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Không có danh mục</p>
            <p className="text-gray-400 text-sm mt-2">{searchInput ? 'Không tìm thấy danh mục phù hợp với tìm kiếm của bạn' : 'Hãy thêm danh mục đầu tiên'}</p>
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
            data={paged}
            sortConfig={sortConfig}
            onSort={(key) => { requestSort(key); }}
            renderRow={(category, index) => (
              <CategoryTableRow
                key={`${category.CategoryID}-${index}`}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            )}
          />
        )}

        {!loading && paged.length >= 0 && totalPages >= 1 && (
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
        title={modalMode === 'create' ? 'Thêm danh mục mới' : modalMode === 'delete' ? 'Xóa danh mục?' : 'Cập nhật danh mục'}
        onClose={() => setShowModal(false)}
        size="md"
      >
        {modalMode === 'delete' ? (
          <div className="space-y-4">
            <p className="text-gray-600">Bạn có chắc chắn muốn xóa danh mục <strong>{selectedCategory?.CategoryName}</strong> không?</p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">Hủy</button>
              <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">Xóa</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500 text-xs">*</span></label>
              <input
                type="text"
                name="CategoryName"
                value={formData.CategoryName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.CategoryName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nhập tên danh mục"
              />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                maxLength={250}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Mô tả ngắn cho danh mục"
                />
                {/* Bộ đếm ký tự */}
                <div className="text-right text-xs text-gray-400 mt-1">
                {formData.Description.length}/250 ký tự
                </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">Hủy</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">{modalMode === 'create' ? 'Tạo' : 'Cập nhật'}</button>
            </div>
          </form>
        )}
      </Modal>
    </MainLayout>
  );
}
