const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Lấy thông báo của tài khoản đang đăng nhập
router.get('/', verifyToken, notificationController.getMyNotifications);

// Đánh dấu tất cả đã đọc (phải đặt trước /:id)
router.patch('/read-all', verifyToken, notificationController.markAllAsRead);

// Đánh dấu một thông báo đã đọc
router.patch('/:id/read', verifyToken, notificationController.markAsRead);

module.exports = router;
