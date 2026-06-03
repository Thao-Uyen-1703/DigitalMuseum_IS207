const orderModel = require('../../models/orderModel');

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
  }
};

module.exports = orderServices;
