const joi = require('joi');

const registerSchema = joi.object({
    fullname: joi.string().trim().min(5).max(100).required().messages({
        'string.empty': 'Họ tên không được để trống',
        'string.min': 'Họ tên tối thiểu 5 ký tự',
        'string.max': 'Họ tên tối đa 100 ký tự',
        'any.required': 'Họ tên không được để trống',
    }),
    phone: joi.string().trim().pattern(/^0[0-9]{9}$/).required().messages({
        'string.pattern.base': 'Số điện thoại phải có 10 số và bắt đầu bằng số 0',
        'any.required': 'Số điện thoại không được bỏ trống'
    }),
    email: joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: true } }).required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Địa chỉ email không hợp lệ',
        'any.required': 'Email không được bỏ trống',
    }),
    password: joi.string().trim().min(5).max(100).required().messages({
        'string.empty': 'Mật khẩu không được để trống',
        'string.min': 'Mật khẩu tối thiểu 5 ký tự',
        'string.max': 'Mật khẩu tối đa 100 ký tự',
        'any.required': 'Mật khẩu không được bỏ trống',
    }),
    repassword: joi.string().valid(joi.ref('password')).required().messages({
        'any.only': 'Mật khẩu nhập lại không khớp',
        'any.required': 'Vui lòng nhập lại mật khẩu',
    })
});

module.exports = registerSchema;