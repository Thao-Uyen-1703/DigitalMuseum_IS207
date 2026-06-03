const joi = require('joi');

const userValidator = joi.object({
  FullName: joi.string().trim().min(3).max(100).required().messages({
    'string.base': 'Họ tên phải là chuỗi ký tự.',
    'string.empty': 'Họ tên không được để trống.',
    'string.min': 'Họ tên tối thiểu 3 ký tự.',
    'string.max': 'Họ tên tối đa 100 ký tự.',
    'any.required': 'Họ tên là bắt buộc.'
  }),
  Email: joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: true } }).required().messages({
    'string.base': 'Email phải là chuỗi ký tự.',
    'string.empty': 'Email không được để trống.',
    'string.email': 'Địa chỉ email không hợp lệ.',
    'any.required': 'Email là bắt buộc.'
  }),
  Role: joi.string().valid('Customer', 'Staff', 'Manager', 'Admin').required().messages({
    'any.only': 'Chức vụ không hợp lệ.',
    'any.required': 'Chức vụ là bắt buộc.'
  }),
  IsActive: joi.boolean().optional()
});

module.exports = userValidator;
