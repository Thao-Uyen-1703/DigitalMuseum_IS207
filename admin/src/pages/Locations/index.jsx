import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner'; // Đã thêm thư viện sonner
import MainLayout from '../../components/MainLayout';
import DataTable from '../../components/table/DataTable';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import useTableSort from '../../components/hooks/useTableSort';
import api from '../../api/axiosClient';
import LocationTableRow from '../../components/table/LocationTableRow';
import ImageDisplay from '../../components/common/ImageDisplay';

export default function LocationList() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [provinces, setProvinces] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [modalError, setModalError] = useState('');
  
  const [formData, setFormData] = useState({
    LocationName: '',
    City: '',
    Description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { sortConfig, requestSort, clearAllSorts } = useTableSort();

  const fetchLocations = async (page = currentPage, currentSearch = searchInput) => {
    setLoading(true);
    const params = { page, perPage: itemPerPage };
    
    if (currentSearch) params.search = currentSearch; 
    
    if (sortConfig) params.sortConfigs = JSON.stringify([sortConfig]);

    try {
      const response = await api.get('/admin/locations', { params });
      if (response.data.success) {
        const data = response.data.data || {};
        setLocations(data.locations || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách địa điểm");
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/v2/?depth=2');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi load các tỉnh thành');
    }
  };

  useEffect(() => {
    fetchLocations(1);
    fetchProvinces();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchLocations(1);
  }, [itemPerPage, sortConfig]);

  const handleRefresh = () => {
    setSearchInput('');
    clearAllSorts();
    setCurrentPage(1);
    fetchLocations(1, '');
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({ LocationName: '', City: '', Description: '' });
    setSelectedLocation(null);
    setImageFile(null);
    setImagePreview(null);
    setModalError('');
    setShowModal(true);
  };

  const handleEdit = (location) => {
    const description = location.Details 
      ? (typeof location.Details === 'string' ? location.Details : '')
      : '';
    
    setModalMode('edit');
    setSelectedLocation(location);
    setFormData({
      LocationName: location.LocationName || '',
      City: location.City || '',
      Description: description
    });
    setImagePreview(location.ThumbnailURL || null);
    setImageFile(null);
    setModalError('');
    setShowModal(true);
  };

  const handleDeleteClick = (location) => {
    setModalMode('delete');
    setSelectedLocation(location);
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    
    const payload = new FormData();
    payload.append('LocationName', formData.LocationName);
    payload.append('City', formData.City);
    payload.append('Description', formData.Description);
    
    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      if (modalMode === 'create') {
        const response = await api.post('/admin/locations', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success(response.data.message || 'Thêm địa điểm thành công');
          fetchLocations(1);
          setShowModal(false);
        } else {
          setModalError(response.data.message || 'Thêm địa điểm thất bại');
        }
      } else if (modalMode === 'edit' && selectedLocation) {
        const response = await api.put(`/admin/locations/${selectedLocation.LocationID}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success(response.data.message || 'Cập nhật địa điểm thành công');
          fetchLocations(currentPage);
          setShowModal(false);
        } else {
          setModalError(response.data.message || 'Cập nhật địa điểm thất bại');
        }
      }
    } catch (error) {
      setModalError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleConfirmDelete = async () => {
    setModalError('');
    try {
      const response = await api.delete(`/admin/locations/${selectedLocation.LocationID}`);
      if (response.data.success) {
        toast.success(response.data.message || 'Xóa địa điểm thành công');
        fetchLocations(currentPage);
        setShowModal(false);
      } else {
        toast.error('Có lỗi xảy ra khi xóa địa điểm');
        setModalError(response.data.message || 'Xóa địa điểm thất bại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa địa điểm');
      setModalError(error.response?.data?.message || 'Có lỗi xảy ra khi xóa, vui lòng thử lại.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024 || !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLocations(1);
  };

  const handlePageChange = (page) => {
    fetchLocations(page);
  };

  const handleItemPerPageChange = (perPage) => {
    setItemPerPage(perPage);
    setCurrentPage(1);
    fetchLocations(1);
  };

  const columns = [
    { key: 'ThumbnailURL', label: 'Ảnh', sortable: false },
    { key: 'LocationName', label: 'Địa điểm', sortable: true },
    { key: 'Details', label: 'Mô tả', sortable: false },
    { key: 'IsFeatured', label: 'Cửa hàng' },
    { key: 'actions', label: 'Thao tác' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý địa điểm</h1>
            <p className="text-sm text-gray-500">Tạo, sửa, tìm kiếm và quản lý địa điểm trong hệ thống.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#2C4C3E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#264033] transition"
          >
            <Plus size={18} /> Thêm địa điểm
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
                placeholder="Tìm kiếm địa điểm..."
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
        ) : locations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Không có địa điểm</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchInput ? 'Không tìm thấy địa điểm phù hợp với tìm kiếm của bạn' : 'Hãy thêm địa điểm đầu tiên'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <DataTable
              columns={columns}
              data={locations}
              sortConfig={sortConfig}
              onSort={(key) => requestSort(key)}
              renderRow={(location, index) => (
                <LocationTableRow
                  key={`${location.LocationID}-${index}`}
                  location={location}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              )}
            />
          </div>
        )}

        {!loading && locations.length > 0 && (
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
            ? 'Thêm địa điểm mới'
            : modalMode === 'delete'
            ? 'Xóa địa điểm?'
            : 'Cập nhật địa điểm'
        }
        onClose={() => setShowModal(false)}
        size="lg"
      >
        {modalMode === 'delete' ? (
          <div className="space-y-6">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa địa điểm <strong>{selectedLocation?.LocationName}</strong> không? Hành động này không thể hoàn tác.
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
                Xóa địa điểm
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="LocationName"
                value={formData.LocationName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] focus:border-transparent transition"
                placeholder="Nhập tên địa điểm"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Thành phố <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="City"
                value={formData.City}
                required
                onChange={(e) => {
                  handleInputChange(e);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setShowCitySuggestions(false)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] focus:border-transparent transition"
                placeholder="Nhập hoặc chọn thành phố"
                autoComplete="off"
              />
              
              {showCitySuggestions && (
                <ul className="absolute z-10 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {provinces
                    .filter((p) => 
                      p.name.toLowerCase().includes((formData.City || '').toLowerCase())
                    )
                    .map((province) => (
                      <li
                        key={province.code}
                        className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm transition"
                        onMouseDown={(e) => {
                          e.preventDefault(); 
                          setFormData((prev) => ({ ...prev, City: province.name }));
                          setShowCitySuggestions(false);
                        }}
                      >
                        {province.name}
                      </li>
                    ))}
                    
                  {provinces.filter((p) => 
                    p.name.toLowerCase().includes((formData.City || '').toLowerCase())
                  ).length === 0 && (
                    <li className="px-4 py-2.5 text-gray-500 text-sm text-center">
                      Không tìm thấy thành phố phù hợp
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C4C3E] focus:border-transparent transition"
                rows={4}
                placeholder="Mô tả địa điểm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ảnh chính (Thumbnail)
              </label>

              <div className="border-2 border-dashed border-gray-200 hover:border-[#2C4C3E] rounded-xl p-4 transition-all bg-gray-50/50">
                <div className="flex flex-col md:flex-row items-center gap-5">
                  <div className="shrink-0">
                    {imagePreview ? (
                      <ImageDisplay
                        src={imagePreview}
                        className="w-28 h-28 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 text-sm shadow-sm">
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
                      Hỗ trợ định dạng: JPG, PNG, WEBP.
                    </p>
                    <p className="text-xs text-gray-500 text-center">
                      Dung lượng tối đa 25MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hiển thị lỗi thêm/sửa ở đây */}
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
                {modalMode === 'create' ? 'Tạo địa điểm' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </MainLayout>
  );
}