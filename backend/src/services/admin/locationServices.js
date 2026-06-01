const diadiemModel = require('../../models/diadiemModel');

const locationServices = {
  getLocationsFilter: async (filters) => {
    const page = parseInt(filters.page) || 1;
    const perPage = parseInt(filters.perPage) || 10;
    const offset = (page - 1) * perPage;

    const [results, totalItems] = await Promise.all([
      diadiemModel.getAdvanceFiltered({ ...filters, perPage, offset }),
      diadiemModel.countAdvanceFiltered(filters)
    ]);

    const totalPages = Math.ceil(totalItems / perPage) || 1;

    const locations = results.map(location => ({
        ...location,
        Details: location.Details ? JSON.parse(location.Details).Description : null
    }));

    return {
      locations,
      totalItems,
      totalPages
    };
  },

  getLocationById: async (id) => {
    const location = await diadiemModel.getLocationById(id);
    if (!location) {
      throw { status: 404, message: 'Địa điểm không tồn tại' };
    }
    return location;
  },

  createLocation: async (data) => {
    const existLocation = await diadiemModel.getLocationByName(data.LocationName);
    if (existLocation) {
      throw { status: 400, message: 'Tên địa điểm đã tồn tại' };
    }

    const payload = {
      LocationName: data.LocationName,
      City: data.City || null,
      ThumbnailURL: data.image ? data.image.filename : null,
      Details: JSON.stringify({ Description: data.Description || '' })
    };

    return await diadiemModel.createLocation(payload);
  },

  updateLocation: async (id, data) => {
    const existLocation = await diadiemModel.getLocationByID(id);
    if (!existLocation) {
      throw { status: 404, message: 'Địa điểm không tồn tại' };
    }

    const sameNameLocation = await diadiemModel.getLocationByName(data.LocationName);
    if (sameNameLocation && sameNameLocation.LocationID !== parseInt(id, 10)) {
      throw { status: 400, message: 'Tên địa điểm đã tồn tại' };
    }

    const currentLocation = await diadiemModel.getLocationById(id);
    const payload = {
      LocationName: data.LocationName,
      City: data.City || null,
      ThumbnailURL: data.image ? data.image.filename : currentLocation.ThumbnailURL,
      Details: JSON.stringify({ Description: data.Description || '' })
    };

    return await diadiemModel.updateLocation(id, payload);
  },

  deleteLocation: async (id) => {
    const exists = await diadiemModel.getLocationByID(id);
    if (!exists) {
      throw { status: 404, message: 'Địa điểm không tồn tại' };
    }

    const hasProduct = await diadiemModel.existProductInLocation(id);
    if (hasProduct) {
      throw { status: 400, message: 'Không thể xóa địa điểm khi còn sản phẩm liên quan' };
    }

    return await diadiemModel.deleteLocation(id);
  }
};

module.exports = locationServices;
