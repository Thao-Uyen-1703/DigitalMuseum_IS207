const locationModel = require('../../models/locationModel');

const locationServices = {
  getLocationsFilter: async (filters) => {
    const page = parseInt(filters.page) || 1;
    const perPage = parseInt(filters.perPage) || 10;
    const offset = (page - 1) * perPage;

    const [results, totalItems] = await Promise.all([
      locationModel.getAdvanceFiltered({ ...filters, perPage, offset }),
      locationModel.countAdvanceFiltered(filters)
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
    const location = await locationModel.getLocationById(id);
    if (!location) {
      throw { status: 404, message: 'Địa điểm không tồn tại' };
    }
    return location;
  },

  createLocation: async (data) => {
    const existLocation = await locationModel.getLocationByName(data.LocationName);
    if (existLocation) {
      throw { status: 400, message: 'Tên địa điểm đã tồn tại' };
    }

    const payload = {
      LocationName: data.LocationName,
      City: data.City || null,
      ThumbnailURL: data.image ? data.image.filename : null,
      Details: JSON.stringify({ Description: data.Description || '' })
    };

    return await locationModel.createLocation(payload);
  },

  updateLocation: async (id, data) => {
    const existLocation = await locationModel.getLocationByID(id);
    if (!existLocation) {
      throw { status: 404, message: 'Địa điểm không tồn tại' };
    }

    const sameNameLocation = await locationModel.getLocationByName(data.LocationName);
    if (sameNameLocation && sameNameLocation.LocationID !== parseInt(id, 10)) {
      throw { status: 400, message: 'Tên địa điểm đã tồn tại' };
    }

    const currentLocation = await locationModel.getLocationById(id);
    const payload = {
      LocationName: data.LocationName,
      City: data.City || null,
      ThumbnailURL: data.image ? data.image.filename : currentLocation.ThumbnailURL,
      Details: JSON.stringify({ Description: data.Description || '' })
    };

    return await locationModel.updateLocation(id, payload);
  },

  deleteLocation: async (id) => {
    const exists = await locationModel.getLocationByID(id);
    if (!exists) {
      throw { status: 404, message: 'Địa điểm không tồn tại' };
    }

    const hasProduct = await locationModel.existProductInLocation(id);
    if (hasProduct) {
      throw { status: 400, message: 'Không thể xóa địa điểm khi còn sản phẩm liên quan' };
    }

    return await locationModel.deleteLocation(id);
  }
};

module.exports = locationServices;
