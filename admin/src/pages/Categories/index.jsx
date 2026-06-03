import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw } from 'lucide-react';
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
  const [modalError, setModalError] = useState('');
  
  const [formData, setFormData] = useState({
    CategoryName: '',
    Description: ''
  });

  const { sortConfig, requestSort, clearAllSorts } = useTableSort();

  const fetchCategories = async (page = currentPage, currentSearch = searchInput) => {
    try {
      setLoading(true);
      const params = { page, perPage: itemPerPage };
      if (currentSearch) params.search = currentSearch;
      if (sortConfig) params.sortConfigs = JSON.stringify([sortConfig]);

      const response = await api.get('/admin/categories', { params });
      if (response.data.success) {
        const data = response.data.data || {};
        setCategories(data.categories || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchCategories(1);
  }, [itemPerPage, sortConfig]);

  const handleRefresh = () => {
    setSearchInput('');
    clearAllSorts();
    setCurrentPage(1);
    fetchCategories(1, '');
  };

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
    setModalError('');
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setModalMode('edit');
    setFormData({
      CategoryName: category.CategoryName ?? '',
      Description: category.Description ?? ''
    });
    setSelectedCategory(category);
    setModalError('');
    setShowModal(true);
  };

  const handleDeleteClick = (category) => {
    setModalMode('delete');
    setSelectedCategory(category);
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    
    try {
      if (modalMode === 'create') {
        const response = await api.post('/admin/categories', formData);
        if (response.data.success) {
          toast.success(response.data.message || 'Tạo danh mục thành công');
          fetchCategories(1);
          setShowModal(false);
        } else {
          setModalError(response.data.message || 'Thêm danh mục thất bại');
        }
      } else if (modalMode === 'edit' && selectedCategory) {
        const response = await api.put(`/admin/categories/${selectedCategory.CategoryID}`, formData);
        if (response.data.success) {
          toast.success(response.data.message || 'Cập nhật danh mục thành công');
          fetchCategories(currentPage);
          setShowModal(false);
        } else {
          setModalError(response.data.message || 'Cập nhật danh mục thất bại');
        }
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleConfirmDelete = async () => {
    setModalError('');
    try {
      const response = await api.delete(`/admin/categories/${selectedCategory.CategoryID}`);
      if (response.data.success) {
        toast.success(response.data.message || 'Xóa danh mục thành công');
        fetchCategories(currentPage);
        setShowModal(false);
      } else {
        setModalError(response.data.message || 'Xóa danh mục thất bại');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa, vui lòng thử lại');
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
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
            <p className="text-sm text-gray-500">Tạo, sửa, tìm kiếm và phân loại danh mục sản phẩm.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#2C4C3E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#264033] transition"
          >
            <Plus size={18} /> Thêm danh mục
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-[#2C4C3E] focus-within:ring-1 focus-within:ring-[#2C4C3E] transition">
              <Search size={18} className="text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm danh mục..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[#2C4C3E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#264033] transition"
            >
              Tìm kiếm
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <RefreshCcw size={18} /> Đặt lại
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Không có danh mục</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchInput ? 'Không tìm thấy danh mục phù hợp với tìm kiếm của bạn' : 'Hãy thêm danh mục đầu tiên'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <DataTable
              columns={columns}
              data={categories}
              sortConfig={sortConfig}
              onSort={(key) => requestSort(key)}
              renderRow={(category, index) => (
                <CategoryTableRow
                  key={`${category.CategoryID}-${index}`}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              )}
            />
          </div>
        )}

        {!loading && categories.length > 0 && (
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
            ? 'Thêm danh mục mới'
            : modalMode === 'delete'
            ? 'Xóa danh mục?'
            : 'Cập nhật danh mục'
        }
        onClose={() => setShowModal(false)}
        size="md"
      >
        {modalMode === 'delete' ? (
          <div className="space-y-6">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa danh mục <strong>{selectedCategory?.CategoryName}</strong> không? Hành động này không thể hoàn tác.
            </p>
            
            {modalError && (
              <div className="text-red-500 text-sm font-medium text-center">
                {modalError}
              </div>
            )}

            <div className="flex gap-3">
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
                Xóa danh mục
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="CategoryName"
                value={formData.CategoryName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] focus:border-transparent transition"
                placeholder="Nhập tên danh mục"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                maxLength={250}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] focus:border-transparent transition"
                rows={4}
                placeholder="Mô tả ngắn cho danh mục"
              />
              <div className="text-right text-xs text-gray-400 mt-1.5">
                {formData.Description.length}/250 ký tự
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
                {modalMode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </MainLayout>
  );
}