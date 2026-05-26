const joi = require('joi');

const profileSchema = joi.object({
    fullName: joi.string().trim().min(5).max(50).required().messages({
        'string.empty': 'Họ tên không được để trống.',
        'string.min': 'Họ tên phải có ít nhất 5 ký tự.',
        'string.max': 'Họ tên không được vượt quá 50 ký tự.',
        'any.required': 'Trường họ tên là bắt buộc.'
    }),
    
    phone: joi.string().trim().pattern(/^0[0-9]{9}$/).required().messages({
        'string.empty': 'Số điện thoại không được để trống.',
        'string.pattern.base': 'Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số và bắt đầu bằng số 0.',
        'any.required': 'Trường số điện thoại là bắt buộc.'
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

module.exports = profileSchema;