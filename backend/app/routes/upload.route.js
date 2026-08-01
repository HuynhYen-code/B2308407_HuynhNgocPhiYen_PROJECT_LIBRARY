const express = require('express');
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const ApiError = require('../utils/api-error');

const router = express.Router();

// Cấu hình Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Đường dẫn thư mục uploads ở gốc của backend/
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // Tạo tên file duy nhất tránh trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Chỉ cho phép ảnh
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Chỉ hỗ trợ upload file hình ảnh!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: fileFilter
});

// Route xử lý upload (chỉ Staff/Admin)
router.post('/', verifyToken, requireRole('Staff', 'Admin'), upload.single('image'), uploadController.uploadImage);

module.exports = router;
