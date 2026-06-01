import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
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
  const [formErrors, setFormErrors] = useState({});
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [formData, setFormData] = useState({
    LocationName: '',
    City: '',
    Description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { sortConfig, requestSort, clearAllSorts } = useTableSort();

  const fetchLocations = async (page = currentPage) => {
    try {
      setLoading(true);
      const params = { page, perPage: itemPerPage };
      if (searchInput) params.search = searchInput;
      if (sortConfig) params.sortConfigs = JSON.stringify([sortConfig]);

      const response = await api.get('/admin/locations', { params });
      if (response.data.success) {
        const data = response.data.data || {};
        setLocations(data.locations || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
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
            console.error("Lỗi fetch địa điểm:", error);
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
    setCurrentPage(1);
    clearAllSorts();
    fetchLocations(1);
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({ LocationName: '', City: '', Description: '' });
    setSelectedLocation(null);
    setImageFile(null);
    setImagePreview(null);
    setFormErrors({});
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
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteClick = (location) => {
    setDeleteError('');
    setModalMode('delete');
    setSelectedLocation(location);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('LocationName', formData.LocationName);
      payload.append('City', formData.City);
      payload.append('Description', formData.Description);
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (modalMode === 'create') {
        const response = await api.post('/admin/locations', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Tạo địa điểm thành công');
          fetchLocations(1);
          setShowModal(false);
        }
      } else if (modalMode === 'edit' && selectedLocation) {
        const response = await api.put(`/admin/locations/${selectedLocation.LocationID}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Cập nhật địa điểm thành công');
          fetchLocations(currentPage);
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error('Error submitting location:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await api.delete(`/admin/locations/${selectedLocation.LocationID}`);
      if (response.data.success) {
        toast.success('Xóa địa điểm thành công');
        fetchLocations(currentPage);
        setShowModal(false);
      }
    } catch (err) {
      setDeleteError(err.response.data.message || "Có lỗi xảy ra khi xóa địa điểm");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLocations(1);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý địa điểm</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            Thêm địa điểm
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm địa điểm..."
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
        ) : locations.length === 0 ? (
          <div className="bg-white rounded-lg p-12 shadow text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Không có địa điểm</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchInput ? 'Không tìm thấy địa điểm phù hợp với tìm kiếm của bạn' : 'Hãy thêm địa điểm đầu tiên'}
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
        )}

        {!loading && locations.length >= 0 && (
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
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa địa điểm <strong>{selectedLocation?.LocationName}</strong> không?
            </p>

              {deleteError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {deleteError}
                </div>
              )}

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
                Tên địa điểm <span className="text-red-500 text-xs">*</span>
              </label>
              <input
                type="text"
                name="LocationName"
                value={formData.LocationName}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.LocationName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tên địa điểm"
              />
              {formErrors.LocationName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.LocationName}</p>
              )}
            </div>

            <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
            <input
                type="text"
                name="City"
                value={formData.City}
                onChange={(e) => {
                handleInputChange(e);
                setShowCitySuggestions(true); // Hiện gợi ý khi bắt đầu gõ
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setShowCitySuggestions(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập hoặc chọn thành phố"
                autoComplete="off"
            />
            
            {/* Dropdown danh sách gợi ý */}
            {showCitySuggestions && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {provinces
                    .filter((p) => 
                    p.name.toLowerCase().includes((formData.City || '').toLowerCase())
                    )
                    .map((province) => (
                    <li
                        key={province.code}
                        className="px-4 py-2 cursor-pointer hover:bg-green-50 hover:text-green-700 transition"
                        // Sử dụng onMouseDown thay vì onClick để event này chạy trước onBlur của thẻ input
                        onMouseDown={(e) => {
                        e.preventDefault(); 
                        setFormData((prev) => ({ ...prev, City: province.name }));
                        setShowCitySuggestions(false);
                        }}
                    >
                        {province.name}
                    </li>
                    ))}
                    
                {/* Hiển thị khi không tìm thấy kết quả */}
                {provinces.filter((p) => 
                    p.name.toLowerCase().includes((formData.City || '').toLowerCase())
                ).length === 0 && (
                    <li className="px-4 py-2 text-gray-500 text-sm text-center">
                    Không tìm thấy thành phố phù hợp
                    </li>
                )}
                </ul>
            )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Mô tả địa điểm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ảnh chính (Thumbnail)
              </label>

              <div
                className={`border-2 border-dashed rounded-xl p-4 transition-all
                  ${
                    formErrors.image
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-green-400"
                  }`}
              >
                <div className="flex flex-col md:flex-row items-center gap-4">
                  
                  {/* Preview */}
                  <div className="shrink-0">
                    {imagePreview ? (
                      <ImageDisplay
                        src={imagePreview}
                        className="w-28 h-28 object-cover rounded-xl border border-gray-200"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>

                  {/* Upload */}
                  <div className="flex-1 w-full">
                    <input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <label
                      htmlFor="thumbnail-upload"
                      className="mx-auto cursor-pointer flex w-fit items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Chọn ảnh
                    </label>

                    <p className="mt-2 text-sm text-gray-500 text-center">
                      JPG, PNG, WEBP • Tối đa 5MB
                    </p>

                    {formErrors.image && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.image}
                      </p>
                    )}
                  </div>
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