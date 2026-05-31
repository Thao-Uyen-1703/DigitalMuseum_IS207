const joi = require('joi');

const productSchema = joi.object({
  ProductName: joi.string().trim().required().messages({
    'string.empty': 'Tên sản phẩm không được để trống.',
    'any.required': 'Tên sản phẩm là bắt buộc.'
  }),

  CategoryID: joi.alternatives().try(joi.string(), joi.number()).required().messages({
    'any.required': 'Vui lòng chọn danh mục.',
    'string.empty': 'Vui lòng chọn danh mục.',
    'number.base': 'Vui lòng chọn danh mục.'
  }),

  OriginLocationID: joi.alternatives().try(joi.string(), joi.number()).required().messages({
    'any.required': 'Vui lòng chọn nguồn gốc.',
    'string.empty': 'Vui lòng chọn nguồn gốc.',
    'number.base': 'Vui lòng chọn nguồn gốc.'
  }),

  LocationIDs: joi.array().items(joi.alternatives().try(joi.string(), joi.number())).min(1).required().messages({
    'array.min': 'Vui lòng chọn ít nhất 1 cửa hàng phân phối.',
    'any.required': 'Cửa hàng phân phối là bắt buộc.'
  }),

  Price: joi.number().min(0).required().messages({
    'number.base': 'Giá phải là một số.',
    'number.min': 'Giá không được nhỏ hơn 0.',
    'any.required': 'Giá là bắt buộc.'
  }),

  Stock: joi.number().integer().min(0).required().messages({
    'number.base': 'Số lượng phải là một số.',
    'number.integer': 'Số lượng phải là số nguyên.',
    'number.min': 'Số lượng không được nhỏ hơn 0.',
    'any.required': 'Số lượng là bắt buộc.'
  }),

  Weight: joi.number().min(0).required().messages({
    'number.base': 'Trọng lượng phải là một số.',
    'number.min': 'Trọng lượng không được nhỏ hơn 0.',
    'any.required': 'Trọng lượng là bắt buộc.'
  }),

  image: joi.object({
        mimetype: joi.string().valid('image/jpeg', 'image/png', 'image/jpg').required().messages({
            'any.only': 'Chỉ chấp nhận định dạng ảnh: png, jpeg, jpg.',
            'any.required': 'Định dạng tệp không hợp lệ.'
        }),
        size: joi.number().max(25 * 1024 * 1024).required().messages({
            'number.max': 'Kích thước ảnh vượt quá giới hạn cho phép (Tối đa 25MB).'
        })
    }).unknown(true).optional().messages({
        'object.base': 'Hình ảnh tải lên không đúng định dạng tệp.'
    })
});

module.exports = productSchema;