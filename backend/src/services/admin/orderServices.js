const orderModel = require('../../models/orderModel');
const PDFDocument = require('pdfkit');

const formatMoney = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const orderServices = {
  getOrders: async (filters) => {
    const page = parseInt(filters.page) || 1;
    const perPage = parseInt(filters.perPage) || 10;
    const offset = (page - 1) * perPage;
    const search = filters.search || '';
    const sortConfigs = Array.isArray(filters.sortConfigs) ? filters.sortConfigs : [];

    const [orders, totalItems] = await Promise.all([
      orderModel.getOrdersFilter({ page, perPage, offset, search, sortConfigs }),
      orderModel.countOrdersFilter({ search })
    ]);


    const mappedOrders = orders.map((order) => {
      const shippingInfo = order.ShippingInfo
        ? JSON.parse(order.ShippingInfo)
        : null;

      return {
        OrderID: order.OrderID,
        OrderTracking: order.OrderTracking,

        Customer: {
          Name:
            order.FullName ||
            shippingInfo?.fullName ||
            'Khách vãng lai',

          IsGuest: !order.FullName,

          Phone: shippingInfo?.phone || null,

          ShippingInfo: shippingInfo
        },

        Order: {
          Status: order.OrderStatus,
          TotalAmount: Number(order.TotalAmount),
          OrderDate: order.OrderDate,
          Note: order.Note
        },

        Payment: order.PaymentID
          ? {
              PaymentID: order.PaymentID,
              Method: order.PaymentMethod,
              Status: order.PaymentStatus
            }
          : null,

        Shipment: order.ShipmentID
          ? {
              ShipmentID: order.ShipmentID,
              MethodName: order.MethodName,
              TrackingNumber: order.TrackingNumber,
              Status: order.ShipmentStatus,
              CreatedAt: order.CreateAt,
              ShippedDate: order.ShippedDate,
              DeliveredDate: order.DeliveredDate
            }
          : null
      };
    });
    
    return {
      orders: mappedOrders,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
      page,
      perPage
    };
  },

  getOrderDetails: async (id) => {
    const order = await orderModel.getOrderByIdAdmin(id);
    if (!order) {
      throw { status: 404, message: 'Đơn hàng không tồn tại' };
    }

    const [address, payment, shipment, orderItems] = await Promise.all([
      order.AddressID ? orderModel.getOrderAddress(order.AddressID) : Promise.resolve(null),
      orderModel.getOrderPayment(order.OrderID),
      orderModel.getOrderShipment(order.OrderID),
      orderModel.getOrderDetails(order.OrderID)
    ]);

    return {
      ...order,
      UserName: order.FullName || (order.UserID ? 'Người dùng' : 'Khách hàng ẩn danh'),
      GuestDetails: order.GuestDetails ? JSON.parse(order.GuestDetails) : null,
      ShippingInfo: order.ShippingInfo ? JSON.parse(order.ShippingInfo) : null,
      Address: address,
      Payment: payment,
      Shipment: shipment,
      OrderItems: orderItems
    };
  },

  createOrder: async (payload) => {
    if (!payload.OrderTracking) {
      throw { status: 400, message: 'OrderTracking là bắt buộc' };
    }

    if (!payload.TotalAmount) {
      throw { status: 400, message: 'TotalAmount là bắt buộc' };
    }

    const orderData = {
      UserID: payload.UserID || null,
      AddressID: payload.AddressID || null,
      OrderDate: payload.OrderDate || new Date(),
      GuestDetails: payload.UserID ? null : payload.GuestDetails || null,
      OrderTracking: payload.OrderTracking,
      TotalAmount: payload.TotalAmount,
      Status: payload.Status || 'Pending',
      Note: payload.Note || ''
    };

    if (orderData.GuestDetails && typeof orderData.GuestDetails !== 'string') {
      orderData.GuestDetails = JSON.stringify(orderData.GuestDetails);
    }

    if (orderData.UserID && orderData.AddressID) {
      const address = await orderModel.getOrderAddress(orderData.AddressID);
      if (!address) {
        throw { status: 400, message: 'Địa chỉ không tồn tại' };
      }
    }

    const orderId = await orderModel.createOrder(orderData);
    return { OrderID: orderId, ...orderData };
  },

  updateOrder: async (id, payload) => {
    const order = await orderModel.getOrderByIdAdmin(id);
    if (!order) {
      throw { status: 404, message: 'Đơn hàng không tồn tại' };
    }

    const updateData = {
      OrderTracking: payload.OrderTracking || order.OrderTracking,
      UserID: payload.UserID !== undefined ? payload.UserID : order.UserID,
      AddressID: payload.AddressID !== undefined ? payload.AddressID : order.AddressID,
      OrderDate: payload.OrderDate || order.OrderDate,
      GuestDetails: payload.UserID ? null : payload.GuestDetails || order.GuestDetails,
      TotalAmount: payload.TotalAmount !== undefined ? payload.TotalAmount : order.TotalAmount,
      Status: payload.Status || order.Status,
      Note: payload.Note !== undefined ? payload.Note : order.Note
    };

    if (updateData.GuestDetails && typeof updateData.GuestDetails !== 'string') {
      updateData.GuestDetails = JSON.stringify(updateData.GuestDetails);
    }

    if (updateData.UserID && updateData.AddressID) {
      const address = await orderModel.getOrderAddress(updateData.AddressID);
      if (!address) {
        throw { status: 400, message: 'Địa chỉ không tồn tại' };
      }
    }

    await orderModel.updateOrder(id, updateData);
    return { OrderID: id, ...updateData };
  },

  deleteOrder: async (id) => {
    const order = await orderModel.getOrderByIdAdmin(id);
    if (!order) {
      throw { status: 404, message: 'Đơn hàng không tồn tại' };
    }

    await orderModel.deleteOrderTransaction(id);
    return true;
  },

  generateInvoicePdf: async (id) => {
    const order = await orderServices.getOrderDetails(id);
    
    if (!order) {
      throw { status: 404, message: 'Không tìm thấy thông tin đơn hàngn' };
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        // Ghi dữ liệu vào mảng buffers
        doc.on('data', buffers.push.bind(buffers));
        
        // Khi kết thúc, gộp các buffer lại và trả về
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        /* --- BẮT ĐẦU VẼ NỘI DUNG PDF --- */
        
        // 1. NẠP FONT TIẾNG VIỆT
        doc.font('src/utils/Roboto-Regular.ttf');

        // ==========================================
        // HEADER: THÔNG TIN CỬA HÀNG & TIÊU ĐỀ HÓA ĐƠN
        // ==========================================
        // (Góc trái: Thông tin Shop của bạn - Có thể tự sửa lại)
        doc.fillColor('#333333').fontSize(16).text('LACANI STORE', 50, 50);
        doc.fillColor('#666666').fontSize(10)
           .text('Địa chỉ: 123 Đường ABC, Quận X, TP.HCM', 50, 70)
           .text('Điện thoại: 0123 456 789', 50, 85)
           .text('Email: contact@store.com', 50, 100);

        // (Góc phải: Chữ HÓA ĐƠN to và mã đơn)
        doc.fillColor('#1f2937').fontSize(24).text('HÓA ĐƠN BÁN HÀNG', 50, 50, { align: 'right' });
        doc.fillColor('#666666').fontSize(10)
           .text(`Mã đơn: #${order.OrderTracking}`, 50, 80, { align: 'right' })
           .text(`Ngày lập: ${new Date(order.OrderDate).toLocaleString('vi-VN')}`, { align: 'right' })
           .text(`Thanh toán: ${order.Payment?.PaymentMethod || 'COD'}`, { align: 'right' });

        // Đường kẻ ngang phân cách Header
        doc.moveTo(50, 130).lineTo(545, 130).lineWidth(1).strokeColor('#e5e7eb').stroke();

        // ==========================================
        // THÔNG TIN KHÁCH HÀNG (Người nhận)
        // ==========================================
        doc.moveDown(2);
        doc.fillColor('#1f2937').fontSize(12).text('THÔNG TIN GIAO HÀNG:', 50, 150);
        
        doc.fillColor('#4b5563').fontSize(10);
        doc.text(`Khách hàng: ${order.ShippingInfo?.fullName || order.UserName || 'Khách vãng lai'}`, 50, 170);
        doc.text(`Số điện thoại: ${order.ShippingInfo?.phone || 'Chưa cập nhật'}`, 50, 185);
        
        const addr = order.ShippingInfo?.shippingAddress;
        if (addr) {
          doc.text(`Địa chỉ: ${addr.addressDetail}, ${addr.district}, ${addr.province}`, 50, 200, { width: 250 });
        }

        // ==========================================
        // BẢNG DANH SÁCH SẢN PHẨM
        // ==========================================
        const tableTop = 250;
        
        // Vẽ nền xám nhạt cho Tiêu đề bảng
        doc.rect(50, tableTop, 495, 25).fillColor('#f3f4f6').fill();
        
        // Text Tiêu đề bảng
        doc.fillColor('#374151').fontSize(10);
        doc.text('TÊN SẢN PHẨM', 60, tableTop + 8);
        doc.text('ĐƠN GIÁ', 260, tableTop + 8, { width: 90, align: 'right' });
        doc.text('SỐ LƯỢNG', 370, tableTop + 8, { width: 50, align: 'center' });
        doc.text('THÀNH TIỀN', 440, tableTop + 8, { width: 95, align: 'right' });
        
        // Kẻ viền dưới cho header
        doc.moveTo(50, tableTop + 25).lineTo(545, tableTop + 25).lineWidth(1).strokeColor('#d1d5db').stroke();

        // Duyệt danh sách sản phẩm
        let currentY = tableTop + 35;
        doc.fillColor('#4b5563').fontSize(10);

        if (order.OrderItems && order.OrderItems.length > 0) {
          order.OrderItems.forEach(item => {
            // Kiểm tra ngắt trang nếu danh sách quá dài
            if (currentY > 700) {
              doc.addPage();
              currentY = 50; // Reset lại Y ở trang mới
            }

            // Tên sản phẩm có thể dài nên sẽ tự động ngắt dòng, lấy chiều cao để canh dòng tiếp theo
            const textHeight = doc.heightOfString(item.ProductName, { width: 190 });
            doc.text(item.ProductName, 60, currentY, { width: 190 });
            
            // Các thông số khác thẳng hàng
            doc.text(formatMoney(item.UnitPrice), 260, currentY, { width: 90, align: 'right' });
            doc.text(item.Quantity.toString(), 370, currentY, { width: 50, align: 'center' });
            
            // Thành tiền đậm hơn chút
            doc.fillColor('#1f2937').text(formatMoney(item.Total), 440, currentY, { width: 95, align: 'right' });
            doc.fillColor('#4b5563'); // Reset màu

            currentY += textHeight + 10; // Nhích xuống cho dòng kẻ
            
            // Kẻ viền mờ phân cách giữa các sản phẩm
            doc.moveTo(50, currentY - 5).lineTo(545, currentY - 5).lineWidth(0.5).strokeColor('#e5e7eb').stroke();
          });
        } else {
          doc.text('Không có sản phẩm nào.', 60, currentY);
          currentY += 20;
          doc.moveTo(50, currentY).lineTo(545, currentY).lineWidth(0.5).strokeColor('#e5e7eb').stroke();
        }

        // ==========================================
        // TỔNG KẾT TIỀN (GÓC DƯỚI BÊN PHẢI)
        // ==========================================
        currentY += 15;
        
        const subTotal = order.OrderItems?.reduce((sum, item) => sum + Number(item.Total), 0) || 0;
        const shippingFee = Number(order.TotalAmount || 0) - subTotal;
        
        // 2. Hiển thị Tạm tính
        doc.fillColor('#6b7280').fontSize(10);
        doc.text('Tạm tính:', 320, currentY, { width: 100, align: 'right' });
        doc.fillColor('#374151').text(formatMoney(subTotal), 440, currentY, { width: 95, align: 'right' });
        
        // 3. Hiển thị Phí vận chuyển
        currentY += 20;
        doc.fillColor('#6b7280');
        doc.text('Phí vận chuyển:', 320, currentY, { width: 100, align: 'right' });
        doc.fillColor('#374151').text(formatMoney(shippingFee), 440, currentY, { width: 95, align: 'right' });

        // Kẻ vạch ngang chốt tổng tiền
        currentY += 20;
        doc.moveTo(320, currentY).lineTo(545, currentY).lineWidth(1).strokeColor('#d1d5db').stroke();
        
        // 4. Hiển thị TỔNG CỘNG
        currentY += 10;
        doc.fillColor('#1f2937').fontSize(12);
        doc.text('TỔNG CỘNG:', 320, currentY + 2, { width: 100, align: 'right' });
        
        // Highlight số tổng bằng font to hơn và màu tối đậm
        doc.fillColor('#111827').fontSize(16)
           .text(formatMoney(order.TotalAmount), 440, currentY, { width: 95, align: 'right' });

        // ==========================================
        // FOOTER LỜI CẢM ƠN (CUỐI TRANG)
        // ==========================================
        // Set cứng text ở bottom trang
        doc.fillColor('#9ca3af').fontSize(10)
           .text('Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!', 50, 750, { align: 'center', width: 495 });
        doc.text('Vui lòng giữ lại hóa đơn để tiện cho việc đổi trả (nếu có).', 50, 765, { align: 'center', width: 495 });

        // Hoàn tất
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = orderServices;
