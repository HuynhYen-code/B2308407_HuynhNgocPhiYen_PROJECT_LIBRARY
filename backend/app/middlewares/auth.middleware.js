const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/api-error');

/**
 * verifyToken – Middleware xác thực JWT.
 * Đọc token từ header: Authorization: Bearer <token>
 * Sau khi xác thực thành công, gắn payload vào req.user
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Không tìm thấy token xác thực. Vui lòng đăng nhập.'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded; // { id, role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
        }
        return next(new ApiError(401, 'Token không hợp lệ.'));
    }
};

module.exports = { verifyToken };
