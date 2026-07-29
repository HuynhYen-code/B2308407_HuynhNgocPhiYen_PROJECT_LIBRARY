const ThongBao = require('../models/notification.model');
const ApiError = require('../utils/api-error');

/**
 * GET /api/notifications
 * Lấy tất cả thông báo của tài khoản đang đăng nhập, sắp xếp mới nhất trước
 */
exports.getMyNotifications = async (req, res, next) => {
    try {
        const { daDoc, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { MaTaiKhoan: req.user.id };
        if (daDoc !== undefined) filter.DaDoc = daDoc === 'true';

        const [notifications, total, unreadCount] = await Promise.all([
            ThongBao.find(filter).sort({ NgayTao: -1 }).skip(skip).limit(parseInt(limit)),
            ThongBao.countDocuments(filter),
            ThongBao.countDocuments({ MaTaiKhoan: req.user.id, DaDoc: false }),
        ]);

        return res.status(200).json({
            data: notifications,
            unreadCount,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy thông báo'));
    }
};

/**
 * PATCH /api/notifications/:id/read
 * Đánh dấu một thông báo đã đọc
 */
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await ThongBao.findOneAndUpdate(
            { _id: req.params.id, MaTaiKhoan: req.user.id },
            { DaDoc: true },
            { new: true }
        );

        if (!notification) return next(new ApiError(404, 'Không tìm thấy thông báo'));

        return res.status(200).json({ data: notification, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật thông báo'));
    }
};

/**
 * PATCH /api/notifications/read-all
 * Đánh dấu tất cả thông báo của tài khoản hiện tại là đã đọc
 */
exports.markAllAsRead = async (req, res, next) => {
    try {
        await ThongBao.updateMany({ MaTaiKhoan: req.user.id, DaDoc: false }, { DaDoc: true });

        return res.status(200).json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật thông báo'));
    }
};
