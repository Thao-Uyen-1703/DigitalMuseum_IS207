const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục lưu trữ tĩnh luôn tồn tại
const uploadDir = path.join(__dirname, '..', '..', 'public', 'images');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedExtensions.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép định dạng ảnh: jpeg, jpg, png, webp'), false);
    }
};

const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = uploadImage;