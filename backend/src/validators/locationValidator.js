const joi = require('joi');

const locationSchema = joi.object({
  LocationName: joi.string().trim().required().min(1).max(100).messages({
    'string.base': 'Tên địa điểm phải là chuỗi ký tự.',
    'string.empty': 'Tên địa điểm không được để trống.',
    'string.max': 'Tên địa điểm không được vượt quá 100 ký tự.',
    'any.required': 'Tên địa điểm là bắt buộc.'
  }),

  City: joi.string().trim().allow('', null).max(100).messages({
    'string.base': 'Thành phố phải là chuỗi ký tự.',
    'string.max': 'Thành phố không được vượt quá 100 ký tự.'
  }),

  Description: joi.string().trim().allow('', null).max(500).messages({
    'string.base': 'Mô tả phải là chuỗi ký tự.',
    'string.max': 'Mô tả không được vượt quá 500 ký tự.'
  }),

  image: joi.any().optional().messages({
    'any.base': 'Ảnh không hợp lệ.'
  })
});

module.exports = locationSchema;
