import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/MainLayout';
import DataTable from '../../components/table/DataTable';
import Pagination from '../../components/common/Pagination';
import useTableSort from '../../components/hooks/useTableSort';
import api from '../../api/axiosClient';
import OrderTableRow from '../../components/table/OrderTableRow';
import Modal from '../../components/common/Modal';
import ImageDisplay from '../../components/common/ImageDisplay';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { sortConfig, requestSort } = useTableSort();

  const [activeOrder, setActiveOrder] = useState(null);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [shipmentFormData, setShipmentFormData] = useState({ trackingNumber: '', status: 'Pending', shippedDate: '', deliveredDate: '' });
  const [paymentFormData, setPaymentFormData] = useState({ paymentMethod: 'COD', paidDate: '', status: 'Pending' });

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [orderDetailsData, setOrderDetailsData] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // THAY ĐỔI 1: Nếu dateStr không tồn tại, tự động lấy ngày giờ hiện tại
  const formatDateTimeLocal = (dateStr) => {
    const rawDate = dateStr ? new Date(dateStr) : new Date();
    return new Date(rawDate.getTime() - rawDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders', {
        params: {
          page: currentPage,
          perPage: itemPerPage,
          search: searchTerm,
          sortConfigs: sortConfig ? JSON.stringify([sortConfig]) : undefined
        }
      });

      if (response.data.success) {
        const result = response.data.data || {};
        const rawOrders = result.orders || [];
        setOrders(rawOrders.map(order => ({
          ...order,
          GuestDetails: order.GuestDetails || null
        })));
        setTotalPages(result.totalPages || 1);
      }
    } catch (err) {
      console.error('Không fetch được đơn hàng:', err);
      toast.error('Không thể tải danh sách đơn hàng từ server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemPerPage, searchTerm, sortConfig]);

  const pagedOrders = orders;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemPerPage, sortConfig]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleViewDetails = async (order) => {
    setIsDetailsModalOpen(true);
    setIsFetchingDetails(true);
    setOrderDetailsData(null); // Reset data cũ
    try {
      // Gọi API lấy full chi tiết theo OrderID
      const response = await api.get(`/admin/orders/${order.OrderID}`);
      if (response.data.success) {
        setOrderDetailsData(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
      setIsDetailsModalOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleExportInvoice = async () => {
    if (!orderDetailsData?.OrderID) return;
    
    // Hiển thị thông báo đang xử lý
    const loadingToast = toast.loading('Đang khởi tạo hóa đơn PDF...');
    
    try {
      // 1. Gọi API với responseType là 'blob' để nhận file nhị phân
      const response = await api.get(`/admin/orders/${orderDetailsData.OrderID}/invoice`, {
        responseType: 'blob', 
      });
      
      // 2. Tạo một URL ảo từ dữ liệu Blob trả về
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      
      // 3. Tạo một thẻ <a> ẩn để giả lập hành động click tải file
      const link = document.createElement('a');
      link.href = url;
      // Đặt tên file khi tải về máy
      link.setAttribute('download', `Hoa_Don_${orderDetailsData.OrderTracking}.pdf`); 
      document.body.appendChild(link);
      
      // 4. Kích hoạt tải xuống
      link.click();
      
      // 5. Dọn dẹp thẻ <a> và URL ảo để giải phóng bộ nhớ
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Đã tải hóa đơn thành công!', { id: loadingToast });
    } catch (error) {
      console.error('Lỗi khi tải hóa đơn:', error);
      toast.error('Không thể tải hóa đơn PDF. Vui lòng thử lại.', { id: loadingToast });
    }
  };

  // ===================== LOGIC VẬN CHUYỂN =====================
  const handleCreateShipment = (order) => {
    setActiveOrder(order);
    setShipmentFormData({ trackingNumber: '', status: 'Pending', shippedDate: '', deliveredDate: '' });
    setIsShipmentModalOpen(true);
  };

  const handleEditShipment = (order) => {
    setActiveOrder(order);
    setShipmentFormData({
      trackingNumber: order.Shipment?.TrackingNumber || order.Shipment?.trackingNumber || '',
      status: order.Shipment?.Status || 'Pending',
      shippedDate: formatDateTimeLocal(order.Shipment?.ShippedDate),
      deliveredDate: formatDateTimeLocal(order.Shipment?.DeliveredDate)
    });
    setIsShipmentModalOpen(true);
  };

  const handleShipmentSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!activeOrder.Shipment;
    const orderid = activeOrder.OrderID || null;

    try {
      if (isEdit) {
        const payload = {
          OrderID: orderid,
          TrackingNumber: shipmentFormData.trackingNumber,
          Status: shipmentFormData.status,
        };
        if (['Shipped', 'Delivered'].includes(shipmentFormData.status)) {
          payload.ShippedDate = shipmentFormData.shippedDate;
        }
        if (shipmentFormData.status === 'Delivered') {
          payload.DeliveredDate = shipmentFormData.deliveredDate;
        }

        await api.put(`/admin/shipments/${activeOrder.Shipment.ShipmentID}`, payload);
        toast.success(`Cập nhật vận chuyển đơn #${activeOrder.OrderTracking} thành công!`);
      } else {
        await api.post('/admin/shipments', {
          OrderID: orderid,
          TrackingNumber: shipmentFormData.trackingNumber,
          Status: 'Pending'
        });
        toast.success('Đã tạo mã vận đơn thành công!');
      }

      setIsShipmentModalOpen(false);
      fetchOrders();

    } catch (error) {
      console.error('Lỗi khi xử lý vận chuyển:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin vận chuyển.';
      toast.error(errorMsg);
    }
  };

  // ===================== LOGIC THANH TOÁN =====================
  const handleCreatePayment = (order) => {
    if (!order.Shipment) {
      toast.error('Cần tạo vận chuyển trước khi tạo thanh toán.');
      return;
    }
    setActiveOrder(order);
    setPaymentFormData({ paymentMethod: 'COD', paidDate: '', status: 'Pending' });
    setIsPaymentModalOpen(true);
  };

  const handleEditPayment = (order) => {
    setActiveOrder(order);
    setPaymentFormData({
      paymentMethod: order.Payment?.Method || order.Payment?.paymentMethod || 'COD',
      paidDate: formatDateTimeLocal(order.Payment?.PaidDate || order.Payment?.paidDate),
      status: order.Payment?.Status || 'Pending'
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!activeOrder.Payment;
    const orderid = activeOrder.OrderID || null;
    const amount = activeOrder.Order?.TotalAmount || activeOrder.TotalAmount || 0;

    try {
      if (isEdit) {
        await api.put(`/admin/payments/${activeOrder.Payment.PaymentID}`, {
          OrderID: orderid,
          PaymentMethod: paymentFormData.paymentMethod,
          Status: paymentFormData.status,
          ...(paymentFormData.status === 'Paid' && { PaidDate: paymentFormData.paidDate })
        });
        toast.success(`Cập nhật thanh toán đơn #${activeOrder.OrderTracking} thành công!`);
      } else {
        await api.post('/admin/payments', {
          OrderID: orderid,
          PaymentMethod: paymentFormData.paymentMethod,
          Amount: amount,
          Status: 'Pending'
        });
        toast.success('Đã khởi tạo thanh toán thành công!');
      }

      setIsPaymentModalOpen(false);
      fetchOrders();

    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin thanh toán.';
      toast.error(errorMsg);
    }
  };

  const columns = [
    { key: 'OrderTracking', label: 'Mã đơn hàng', sortable: true, align: 'left', width: 'w-[18%]' },
    { key: 'User', label: 'Thông tin khách hàng', align: 'left', width: 'w-[25%]' },
    { key: 'TotalAmount', label: 'Tổng tiền & Trạng thái', sortable: true, align: 'left', width: 'w-[17%]' },
    { key: 'Logistics', label: 'VẬN CHUYỂN & THANH TOÁN', align: 'center', width: 'w-[20%]' },
    { key: 'Note', label: 'GHI CHÚ', align: 'left', width: 'w-[12%]' },
    { key: 'Actions', label: 'XEM', align: 'center', width: 'w-[8%]' }
  ];

  const isShipmentEdit = !!activeOrder?.Shipment;
  const isPaymentEdit = !!activeOrder?.Payment;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
            <p className="text-sm text-gray-500 mt-1">Danh sách đơn hàng, tìm kiếm và cập nhật vận chuyển/thanh toán</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm bằng mã đơn, khách hàng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Search size={18} />
            Tìm kiếm
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg">Đang tải...</div>
        ) : pagedOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 shadow text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Không có đơn hàng</p>
            <p className="text-gray-400 text-sm mt-2">Hãy thử lại với từ khóa khác hoặc làm mới trang.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={pagedOrders}
            sortConfig={sortConfig}
            onSort={(key) => requestSort(key)}
            renderRow={(order, index) => (
              <OrderTableRow
                key={`${order.OrderID}-${index}`}
                order={order}
                onCreateShipment={handleCreateShipment}
                onEditShipment={handleEditShipment}
                onCreatePayment={handleCreatePayment}
                onEditPayment={handleEditPayment}
                onViewDetails={handleViewDetails}
              />
            )}
          />
        )}

        {!loading && pagedOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemPerPage={itemPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemPerPageChange={(perPage) => setItemPerPage(perPage)}
          />
        )}
      </div>

      {/* ================= MODAL VẬN CHUYỂN ================= */}
      <Modal
        isOpen={isShipmentModalOpen}
        title={isShipmentEdit ? `Cập nhật vận chuyển #${activeOrder?.OrderTracking}` : `Tạo vận chuyển mới`}
        onClose={() => setIsShipmentModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleShipmentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mã vận đơn</label>
            <input
              type="text"
              required
              placeholder="LCN...."
              value={shipmentFormData.trackingNumber}
              onChange={(e) => setShipmentFormData({ ...shipmentFormData, trackingNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          {isShipmentEdit && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái vận chuyển</label>
                <select
                  value={shipmentFormData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    const now = formatDateTimeLocal();
                    
                    setShipmentFormData({ 
                      ...shipmentFormData, 
                      status: newStatus,
                      shippedDate: (newStatus === 'Delivering' || newStatus === 'Delivered') && !activeOrder?.Shipment?.ShippedDate ? now : shipmentFormData.shippedDate,
                      deliveredDate: newStatus === 'Delivered' && !activeOrder?.Shipment?.DeliveredDate ? now : shipmentFormData.deliveredDate
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 font-medium"
                >
                  <option value="Pending">Chờ lấy hàng</option>
                  <option value="Shipping">Đang giao hàng</option>
                  <option value="Delivered">Đã giao hàng</option>
                  <option value="Failed">Giao hàng không thành công</option>
                  <option value="Returned">Đã trả hàng</option>
                </select>
              </div>

              {['Delivering', 'Delivered'].includes(shipmentFormData.status) && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày bắt đầu giao hàng</label>
                  <input
                    type="datetime-local"
                    required
                    value={shipmentFormData.shippedDate}
                    onChange={(e) => setShipmentFormData({ ...shipmentFormData, shippedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}

              {shipmentFormData.status === 'Delivered' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày giao thành công</label>
                  <input
                    type="datetime-local"
                    required
                    value={shipmentFormData.deliveredDate}
                    onChange={(e) => setShipmentFormData({ ...shipmentFormData, deliveredDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setIsShipmentModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
              {isShipmentEdit ? 'Cập nhật trạng thái' : 'Tạo mã vận đơn'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL THANH TOÁN ================= */}
      <Modal
        isOpen={isPaymentModalOpen}
        title={isPaymentEdit ? `Cập nhật thanh toán #${activeOrder?.OrderTracking}` : `Khởi tạo thanh toán`}
        onClose={() => setIsPaymentModalOpen(false)}
        size="md"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phương thức thanh toán</label>
            <select
              value={paymentFormData.paymentMethod}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="COD">Thanh toán khi nhận hàng</option>
              <option value="Banking">Chuyển khoản ngân hàng</option>
            </select>
          </div>

          {isPaymentEdit && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái dòng tiền</label>
                <select
                  value={paymentFormData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    const now = formatDateTimeLocal(); // Lấy đúng thời điểm vừa click
                    
                    setPaymentFormData({ 
                      ...paymentFormData, 
                      status: newStatus,
                      // THAY ĐỔI 3: Nếu click trạng thái mới và data cũ chưa có -> điền thời gian hiện tại
                      paidDate: newStatus === 'Paid' && !(activeOrder?.Payment?.PaidDate || activeOrder?.Payment?.paidDate) ? now : paymentFormData.paidDate
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 font-medium"
                >
                  <option value="Pending">Chờ thanh toán</option>
                  <option value="Paid">Đã thanh toán</option>
                  <option value="Failed">Thanh toán lỗi</option>
                  <option value="Refunded">Đã hoàn tiền</option>
                </select>
              </div>

              {paymentFormData.status === 'Paid' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Thời gian ghi nhận thanh toán</label>
                  <input
                    type="datetime-local"
                    required
                    value={paymentFormData.paidDate}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paidDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition">
              {isPaymentEdit ? 'Lưu thay đổi' : 'Xác nhận khởi tạo'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        title={`Chi tiết đơn hàng #${orderDetailsData?.OrderTracking || '...'}`}
        onClose={() => setIsDetailsModalOpen(false)}
        size="lg" // Dùng size lớn (lg hoặc xl) để chứa bảng
      >
        {isFetchingDetails ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : orderDetailsData ? (
          <div className="space-y-6 print:space-y-4">
            
            {/* THÔNG TIN NHẬN HÀNG & ĐƠN HÀNG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thông tin nhận hàng</h3>
                <div className="text-sm text-gray-800 space-y-1">
                  <p className="font-semibold text-base">{orderDetailsData.ShippingInfo?.fullName || orderDetailsData.UserName}</p>
                  <p className="font-medium">SĐT: <span>{orderDetailsData.ShippingInfo?.phone || 'Chưa cập nhật'}</span></p>
                  <p className="font-medium">
                    Địa chỉ: <span>{orderDetailsData.ShippingInfo?.shippingAddress?.addressDetail}, {orderDetailsData.ShippingInfo?.shippingAddress?.district}, {orderDetailsData.ShippingInfo?.shippingAddress?.province}</span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thông tin đơn hàng</h3>
                <div className="text-sm text-gray-800 space-y-1">
                  <p>Ngày đặt: <span className="font-medium">{new Date(orderDetailsData.OrderDate).toLocaleString('vi-VN')}</span></p>
                  <p>Trạng thái: <span className="font-medium text-blue-600">{orderDetailsData.Status}</span></p>
                  <p>Thanh toán: <span className="font-medium">{orderDetailsData.Payment?.PaymentMethod || 'Chưa cập nhật'}</span></p>
                  <p>Vận chuyển: <span className="font-medium">{orderDetailsData.Shipment?.MethodName || 'Chưa cập nhật'}</span></p>
                </div>
              </div>
            </div>

            {/* BẢNG SẢN PHẨM */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Danh sách sản phẩm</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">SL</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Đơn giá</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderDetailsData.OrderItems && orderDetailsData.OrderItems.length > 0 ? (
                      orderDetailsData.OrderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 flex items-center gap-3">
                            {item.ImageURL ? (
                              <ImageDisplay src={item.ImageURL} alt={item.ProductName} className="w-10 h-10 object-cover rounded border border-gray-200" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-xs">Ảnh</div>
                            )}
                            <span className="text-sm font-medium text-gray-800 line-clamp-2">{item.ProductName}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-gray-700">{item.Quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{formatMoney(item.UnitPrice)}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-800">{formatMoney(item.Total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-400">Không tìm thấy sản phẩm nào trong đơn hàng này.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TỔNG KẾT TIỀN */}
            <div className="flex justify-end mt-2 break-inside-avoid">
              <div className="w-full sm:w-80 bg-blue-50/40 print:bg-transparent p-4 rounded-xl border border-blue-100 print:border-none space-y-2.5">
                
                {(() => {
                  // 1. Tính Tạm tính (Subtotal) = Tổng các cột Total của sản phẩm
                  const subTotal = orderDetailsData.OrderItems?.reduce((sum, item) => sum + Number(item.Total), 0) || 0;
                  
                  // 2. Tính Phí vận chuyển = Tổng thanh toán - Tạm tính
                  const shippingFee = Number(orderDetailsData.TotalAmount || 0) - subTotal;

                  return (
                    <>
                      <div className="flex justify-between text-sm text-gray-600 print:text-gray-800">
                        <span>Tạm tính:</span>
                        <span className="font-medium">{formatMoney(subTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 print:text-gray-800">
                        <span>Phí vận chuyển:</span>
                        <span className="font-medium">{formatMoney(shippingFee)}</span>
                      </div>
                      
                      <div className="border-t border-dashed border-blue-200 print:border-gray-400 my-2"></div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">TỔNG CỘNG:</span>
                        <span className="text-xl font-black text-blue-600 print:text-gray-900">{formatMoney(orderDetailsData.TotalAmount)}</span>
                      </div>
                    </>
                  );
                })()}

              </div>
            </div>

            {/* NÚT ACTION (Ẩn khi in ấn - dùng class print:hidden nếu có CSS print) */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsDetailsModalOpen(false)} 
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Đóng
              </button>
              <button 
                type="button" 
                onClick={handleExportInvoice}
                className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl text-sm hover:bg-black transition flex items-center gap-2"
              >
                Xuất hóa đơn
              </button>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">Lỗi không tải được dữ liệu.</div>
        )}
      </Modal>
    </MainLayout>
  );
}