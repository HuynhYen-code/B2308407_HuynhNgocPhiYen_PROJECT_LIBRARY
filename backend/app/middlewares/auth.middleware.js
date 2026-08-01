const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/api-error');

/**
 * verifyToken – Middleware xác thực JWT.
 * Đọc token từ header: Authorization: Bearer <token>
 * Sau khi xác thực thành công, gắn payload vào req.user
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Không tìm thấy token xác thực. Vui lòng đăng nhập.'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded; // { id, role, iat, exp }

        if (req.user.role === 'Staff') {
            const NhanVien = require('../models/staff.model');
            const staff = await NhanVien.findOne({ MaTaiKhoan: req.user.id });
            if (staff && staff.TrangThai === 'NghiViec') {
                return next(new ApiError(401, 'Tài khoản của bạn đã bị đình chỉ công tác. Vui lòng liên hệ Admin.'));
            }
        }

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
        }
        return next(new ApiError(401, 'Token không hợp lệ.'));
    }
};

module.exports = { verifyToken };
