const userModel = require('../../models/userModel');
const bcrypt = require('bcrypt');

const userServices = {
  getUsersFilter: async (filters) => {
    const page = parseInt(filters.page) || 1;
    const perPage = parseInt(filters.perPage) || 10;
    const offset = (page - 1) * perPage;

    const [results, totalItems] = await Promise.all([
      userModel.getUsersFilter({ ...filters, perPage, offset }),
      userModel.countUsersFilter(filters)
    ]);

    const totalPages = Math.max(Math.ceil(totalItems / perPage), 1);

    return {
      users: results,
      totalItems,
      totalPages
    };
  },

  createUser: async (data) => {
    const existUser = await userModel.findUserByEmail(data.Email);

    if (existUser) {
      throw { status: 400, message: 'Email đã tồn tại' };
    }

    const password = data.Password ? data.Password : '123123';

    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password, salt);

    const userData = {
      FullName: data.FullName,
      Email: data.Email,
      Role: data.Role,
      PasswordHash: hashPassword, 
      IsActive: data.IsActive !== undefined ? data.IsActive : 1
    };

    return userModel.createUser(data);
  },

  updateUser: async (id, data) => {
    const existingUser = await userModel.findUserById(id);
    if (!existingUser) {
      throw { status: 400, message: 'Người dùng không tồn tại' };
    }

    if (data.Email && data.Email !== existingUser.Email) {
      const duplicate = await userModel.findUserByEmail(data.Email);
      if (duplicate) {
        throw { status: 400, message: 'Email đã được sử dụng bởi người dùng khác' };
      }
    }

    return userModel.updateUser(id, data);
  }
};

module.exports = userServices;
