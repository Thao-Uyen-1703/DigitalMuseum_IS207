const joi = require('joi');

const categorySchema = joi.object({
    CategoryName: joi.string().trim().required().min(1).max(100).messages({
        'string.base': 'Tên danh mục phải là chuỗi ký tự.',
        'string.empty': 'Tên danh mục không được để trống.',
        'string.max': 'Tên danh mục không được vượt quá 100 ký tự.',
        'any.required': 'Tên danh mục là bắt buộc.'
    }),

    Description: joi.string().trim().allow('', null).max(255).messages({
        'string.base': 'Mô tả phải là chuỗi ký tự.',
        'string.max': 'Mô tả không được vượt quá 255 ký tự.'
    })
});

module.exports = categorySchema;