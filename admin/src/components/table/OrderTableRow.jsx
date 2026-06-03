import React from 'react';
import { Edit3, Package, CreditCard, MapPin, Calendar, ClipboardList, Eye } from 'lucide-react';

export default function OrderTableRow({
  order,
  onCreateShipment,
  onEditShipment,
  onCreatePayment,
  onEditPayment,
  onViewDetails
}) {
  const customerName = order.Customer.Name;

  const shipmentExists = !!order.Shipment;
  const paymentExists = !!order.Payment;

  const orderStatus = order.Order.Status;
  const paymentStatus = order.Payment?.Status;
  const paymentMethod = order.Payment?.Method;
  const shipmentStatus = order.Shipment?.Status;

  const orderStatusMap = {
    Pending: {
      label: 'Đang xử lý',
      className: 'bg-orange-50 border-orange-200 text-orange-600'
    },
    Processing: {
      label: 'Đang chuẩn bị',
      className: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    },
    Completed: {
      label: 'Hoàn tất',
      className: 'bg-green-50 border-green-200 text-green-600'
    },
    Canceled: {
      label: 'Đã hủy',
      className: 'bg-red-50 border-red-200 text-red-600'
    }
  };

  const shipmentStatusMap = {
    Pending: {
      label: 'Chờ lấy hàng',
      className:
        'text-orange-600 bg-orange-50 hover:bg-orange-600 border-orange-100 hover:text-white'
    },

    Shipping: {
      label: 'Đang giao hàng',
      className:
        'text-blue-600 bg-blue-50 hover:bg-blue-600 border-blue-100 hover:text-white'
    },

    Delivered: {
      label: 'Đã giao thành công',
      className:
        'text-green-600 bg-green-50 hover:bg-green-600 border-green-100 hover:text-white'
    },

    Failed: {
      label: 'Giao thất bại',
      className:
        'text-red-600 bg-red-50 hover:bg-red-600 border-red-100 hover:text-white'
    },

    Returned: {
      label: 'Đã hoàn hàng',
      className:
        'text-purple-600 bg-purple-50 hover:bg-purple-600 border-purple-100 hover:text-white'
    }
  };

  const paymentStatusMap = {
    Pending: {
      label: 'Chờ thanh toán',
      className: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-600 hover:text-white'
    },
    Paid: {
      label: 'Đã thanh toán',
      className: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white'
    },
    Failed: {
      label: 'Thanh toán lỗi',
      className: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
    },
    Refunded: {
      label: 'Đã hoàn tiền',
      className: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
    }
  };

  const currentOrderStatus =
    orderStatusMap[orderStatus] || {
      label: orderStatus,
      className: 'bg-gray-50 border-gray-200 text-gray-600'
  };

  const currentPaymentStatus =
    paymentStatusMap[paymentStatus] || {
      label: paymentStatus,
      className: 'bg-gray-50 border-gray-200 text-gray-600'
  };

  const currentShipmentStatus = 
    shipmentStatusMap[shipmentStatus] || {
      label: shipmentStatus,
      className: 'bg-gray-50 border-gray-200 text-gray-600'
  };

  const shipmentTextColor = currentShipmentStatus.className.match(/text-[a-z]+-\d+/)?.[0] || 'text-gray-600';
  const paymentTextColor = currentPaymentStatus.className.match(/text-[a-z]+-\d+/)?.[0] || 'text-gray-600';

  const formatMoney = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const dateStr = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return (
      <>
        <span className="font-semibold text-gray-800 text-sm">{timeStr} </span>
        <span className="text-xs text-gray-400 font-normal">{dateStr}</span>
      </>
    )
  };

  const renderAddress = (ShippingInfo) => {
    if (!ShippingInfo) return <div className="text-xs text-gray-400 mt-1">-</div>;

    const { phone, shippingAddress } = ShippingInfo;

    return (
      <div className="mt-1.5 flex flex-col text-xs text-gray-600 italic space-y-0.5">
        {/* Cụm Icon và Số điện thoại */}
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span className="font-medium">{phone || 'Chưa cập nhật SĐT'}</span>
        </div>

        {/* Cụm địa chỉ: Dùng pl-5 (padding-left) để thụt lề cho bằng với chữ của số điện thoại ở trên */}
        {shippingAddress ? (
        <div>
          <div>
            {shippingAddress.province}
            {shippingAddress.district && `, ${shippingAddress.district}`}
          </div>

          <div className="text-gray-500">
            {shippingAddress.addressDetail}
          </div>
        </div>
        ) : (
          <div className="text-gray-400">Không có địa chỉ</div>
        )}
      </div>
    );
  };

  return (
    <tr className="group hover:bg-blue-50/40 transition-all border-b border-gray-100">
      {/* CỘT 1: ĐƠN HÀNG */}
      <td className="px-6 py-4 align-top">
        <div className="flex flex-col">
          <span className="font-bold text-blue-600 text-sm tracking-wide">#{order.OrderTracking}</span>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
            <Calendar size={11} />
            <span>{formatDate(order.Order?.OrderDate)}</span>
          </div>
        </div>
      </td>

      {/* CỘT 2: KHÁCH HÀNG & ĐỊA CHỈ */}
      <td className="px-6 py-4 align-top">
        <div className="max-w-[220px]">
          <div className="font-semibold text-gray-800 text-sm truncate">
            {customerName}
          </div>
          {renderAddress(order.Customer?.ShippingInfo)}
        </div>
      </td>

      {/* CỘT 3: TỔNG TIỀN & TRẠNG THÁI ĐƠN */}
      <td className="px-6 py-4 align-top">
        <div className="flex flex-col items-start">
          <span className="font-bold text-gray-900 text-sm">{formatMoney(order.Order?.TotalAmount)}</span>
          <div className="mt-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentOrderStatus.className}`}>
              {currentOrderStatus.label}
            </span>
          </div>
        </div>
      </td>

      {/* CỘT 4: LOGISTICS VẬN CHUYỂN & THANH TOÁN (ĐÃ ÁP DỤNG MAP) */}
      <td className="px-6 py-4 align-top">
        <div className="flex justify-center items-center gap-5">
          {/* Vận chuyển */}
          <div className="flex flex-col items-center">
            {shipmentExists ? (
              <button 
                onClick={() => onEditShipment(order)} 
                className={`p-2 rounded-xl transition-all shadow-sm border ${currentShipmentStatus.className}`}
                title="Cập nhật thông tin vận chuyển"
              >
                <Package size={16} />
              </button>
            ) : (
              <button 
                onClick={() => onCreateShipment(order)} 
                className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all border border-gray-200 border-dashed"
                title="Vận chuyển đơn hàng"
              >
                <Package size={16} className="opacity-70" />
              </button>
            )}
            <span className={`text-[10px] mt-1.5 font-semibold ${shipmentExists ? shipmentTextColor : 'text-gray-400'}`}>
              {shipmentExists ? currentShipmentStatus.label : 'Chưa cập nhật'}
            </span>
          </div>

          <div className="w-[1px] h-8 bg-gray-200"></div>

          {/* Thanh toán */}
          <div className="flex flex-col items-center">
            {paymentExists ? (
              <button 
                onClick={() => onEditPayment(order)} 
                className={`p-2 rounded-xl transition-all shadow-sm border ${currentPaymentStatus.className}`}
                title="Xem/Sửa thông tin thanh toán"
              >
                <CreditCard size={16} />
              </button>
            ) : (
              <button 
                onClick={() => onCreatePayment(order)} 
                className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-gray-200 border-dashed"
                title="Thêm thanh toán"
              >
                <CreditCard size={16} className="opacity-70" />
              </button>
            )}
            <span className={`text-[10px] mt-1.5 font-semibold ${paymentExists ? paymentTextColor : 'text-gray-400'}`}>
              {paymentExists ? currentPaymentStatus.label : 'Chưa t.toán'}
            </span>
          </div>
        </div>
      </td>

      {/* CỘT 5: GHI CHÚ */}
      <td className="px-6 py-4 align-top w-[12%]">
        {order.Order.Note ? (
          <div
            className="flex items-center gap-1.5 text-gray-500"
            title={order.Order.Note}
          >
            <ClipboardList size={14} className="shrink-0" />
            <span className="text-xs truncate max-w-[80px]">
              {order.Order.Note}
            </span>
          </div>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>

      {/* CỘT 6: HÀNH ĐỘNG CHI TIẾT SẢN PHẨM */}
      <td className="px-6 py-4 text-center align-top w-[8%]">
        <button
          onClick={() => onViewDetails(order)}
          className="p-2 bg-gray-50 hover:bg-blue-600 text-gray-500 hover:text-white rounded-xl transition-all shadow-sm border border-gray-200 hover:border-blue-600 active:scale-95 inline-flex items-center justify-center"
          title="Xem chi tiết sản phẩm trong đơn"
        >
          <Eye size={16} />
        </button>
      </td>
    </tr>
  );
}