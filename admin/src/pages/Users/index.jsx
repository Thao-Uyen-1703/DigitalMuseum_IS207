import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/MainLayout';
import DataTable from '../../components/table/DataTable';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import useTableSort from '../../components/hooks/useTableSort';
import api from '../../api/axiosClient';
import UserTableRow from '../../components/table/UserTableRow';

const roleOptions = ['All', 'Customer', 'Staff', 'Manager', 'Admin'];

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Role: 'Customer',
    IsActive: true
  });

  const { sortConfig, requestSort, clearAllSorts } = useTableSort();

  const fetchUsers = async (page = 1, perPage = 10, search = '', role = 'All', sort = null) => {
    try {
      setLoading(true);
      const params = { page, perPage, search };
      if (role && role !== 'All') params.role = role;
      if (sort) params.sortConfigs = JSON.stringify([sort]);

      const response = await api.get('/admin/users', { params });
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, itemPerPage, '', 'All', null);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1, itemPerPage, searchInput, filterRole, sortConfig);
  }, [sortConfig]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, itemPerPage, searchInput, filterRole, sortConfig);
  };

  const handleFilterRole = (role) => {
    setFilterRole(role);
    setCurrentPage(1);
    fetchUsers(1, itemPerPage, searchInput, role, sortConfig);
  };

  const handleRefresh = () => {
    setSearchInput('');
    setFilterRole('All');
    clearAllSorts();
    fetchUsers(1, itemPerPage, '', 'All', null);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData({ FullName: '', Email: '', Role: 'Customer', IsActive: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      FullName: user.FullName || '',
      Email: user.Email || '',
      Role: user.Role || 'Customer',
      IsActive: Boolean(user.IsActive)
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleToggleActive = async (user) => {
    try {
      const updated = { ...user, IsActive: !Boolean(user.IsActive) };
      await api.put(`/admin/users/${user.UserID}`, updated);
      toast.success(`Đã ${updated.IsActive ? 'kích hoạt' : 'vô hiệu'} người dùng`);
      fetchUsers(currentPage, itemPerPage, searchInput, filterRole, sortConfig);
    } catch (err) {
      console.error(err);
      toast.error('Thay đổi trạng thái không thành công.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormErrors({});

    try {
      if (modalMode === 'create') {
        await api.post('/admin/users', {
          FullName: formData.FullName,
          Email: formData.Email,
          Role: formData.Role,
          IsActive: formData.IsActive
        });
        toast.success('Tạo người dùng thành công');
      } else {
        await api.put(`/admin/users/${selectedUser.UserID}`, {
          FullName: formData.FullName,
          Email: formData.Email,
          Role: formData.Role,
          IsActive: formData.IsActive
        });
        toast.success('Cập nhật người dùng thành công');
      }

      setShowModal(false);
      fetchUsers(currentPage, itemPerPage, searchInput, filterRole, sortConfig);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
        return;
      }
      const message = err.response?.data?.message;
      toast.error(message || 'Có lỗi xảy ra khi lưu người dùng');
    }
  };

  const columns = [
    { key: 'FullName', label: 'Họ tên', sortable: true },
    { key: 'Email', label: 'Email' },
    { key: 'Role', label: 'Chức vụ', sortable: true },
    { key: 'IsActive', label: 'Trạng thái' },
    { key: 'actions', label: 'Thao tác' }
  ];

    const handlePageChange = (page) => {
        fetchUsers(page, itemPerPage, searchInput, sortConfig);
    };

    const handleItemPerPageChange = (perPage) => {
        setItemPerPage(perPage);
        fetchUsers(1, perPage, searchInput, sortConfig);
    };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="text-sm text-gray-500">Tạo, sửa, tìm kiếm và quản lý trạng thái người dùng hệ thống.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2C4C3E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#264033] transition"
          >
            <Plus size={18} /> Tạo người dùng
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <Search size={18} className="text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm theo tên hoặc email"
                className="w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center justify-center rounded-xl bg-[#2C4C3E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#264033] transition"
            >
              Tìm kiếm
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={filterRole}
              onChange={(e) => handleFilterRole(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role === 'All' ? 'Tất cả chức vụ' : role}</option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <RefreshCcw size={18} /> Đặt lại
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                Không có người dùng phù hợp.
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={users}
                sortConfig={sortConfig}
                onSort={requestSort}
                renderRow={(user) => (
                  <UserTableRow
                    key={user.UserID}
                    user={user}
                    onEdit={openEditModal}
                    onToggleActive={handleToggleActive}
                  />
                )}
              />
            )}
          </>
        )}

        {!loading && users.length > 0 && (
          <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemPerPage={itemPerPage}
              onPageChange={handlePageChange}
              onItemPerPageChange={handleItemPerPageChange}
          />
        )}

        <Modal isOpen={showModal} title={modalMode === 'create' ? 'Tạo người dùng mới' : 'Cập nhật người dùng'} onClose={() => setShowModal(false)} size="md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4">
              <label className="block text-sm font-medium text-gray-700">
                Họ tên
                <input
                  value={formData.FullName}
                  onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#2C4C3E]"
                />
                {formErrors.FullName && <p className="mt-1 text-xs text-red-600">{formErrors.FullName}</p>}
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#2C4C3E]"
                />
                {formErrors.Email && <p className="mt-1 text-xs text-red-600">{formErrors.Email}</p>}
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Chức vụ
                <select
                  value={formData.Role}
                  onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#2C4C3E]"
                >
                  <option value="Customer">Customer</option>
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
                {formErrors.Role && <p className="mt-1 text-xs text-red-600">{formErrors.Role}</p>}
              </label>

              {modalMode === 'edit' && (
                <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  Hoạt động
                  <input
                    type="checkbox"
                    checked={formData.IsActive}
                    onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-[#2C4C3E] focus:ring-[#2C4C3E]"
                  />
                </label>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#2C4C3E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#264033] transition"
              >
                Lưu lại
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
