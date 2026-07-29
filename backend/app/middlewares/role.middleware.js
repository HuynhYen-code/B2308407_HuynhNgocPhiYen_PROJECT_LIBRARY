const ApiError = require('../utils/api-error');

/**
 * requireRole – Middleware phân quyền theo vai trò.
 * Sử dụng sau verifyToken.
 *
 * @param {...string} roles - Danh sách vai trò được phép truy cập
 * @example
 *   router.get('/', verifyToken, requireRole('Staff', 'Admin'), controller.getAll);
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Chưa xác thực. Vui lòng đăng nhập.'));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    `Bạn không có quyền thực hiện thao tác này. Yêu cầu vai trò: ${roles.join(', ')}.`
                )
            );
        }

        next();
    };
};

module.exports = { requireRole };
