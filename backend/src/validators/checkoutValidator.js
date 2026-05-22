const joi = require('joi');

const checkoutSchema = joi.object({
    items: joi.array().items(
        joi.object({
            productId: joi.number().integer().required(),
            quantity: joi.number().integer().min(1).required()
        })
    ).min(1).required().messages({
        'array.min': 'Giỏ hàng phải có ít nhất 1 sản phẩm',
        'any.required': 'Danh sách sản phẩm không được trống'
    }),
    customerInfo: joi.object({
        fullName: joi.string().trim().min(3).max(100).required().messages({
            'string.empty': 'Họ tên không được để trống'
        }),
        email: joi.string().trim().email().required().messages({
            'string.email': 'Email không hợp lệ'
        }),
        phone: joi.string().trim().pattern(/^0[0-9]{9}$/).required().messages({
            'string.pattern.base': 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0'
        }),
        shippingAddress: joi.object({
            province: joi.string().trim().required().messages({
                'string.empty': 'Tỉnh/Thành phố không được bỏ trống'
            }),
            district: joi.string().trim().required().messages({
                'string.empty': 'Quận/Huyện không được bỏ trống'
            }),
            addressDetail: joi.string().trim().required().messages({
                'string.empty': 'Số nhà cụ thể không được bỏ trống'
            })
        }).required(),
        note: joi.string().allow('', null),
        isNewAddress: joi.boolean().default(true)
    }).required(),
    paymentMethod: joi.string().valid('COD', 'VNPAY').required(),
    shippingMethodId: joi.number().integer().required()
});

module.exports = checkoutSchema;