const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrow.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { runManually } = require('../jobs/overdue.job');

// [DEV/ADMIN] Trigger overdue job thủ công để test
router.post(
    '/admin/trigger-overdue-job',
    verifyToken,
    requireRole('Admin'),
    async (req, res, next) => {
        try {
            await runManually();
            return res.status(200).json({ message: 'Overdue job đã chạy xong. Kiểm tra console để xem chi tiết.' });
        } catch (err) {
            return next(err);
        }
    }
);

// Danh sách (Staff/Admin)
router.get('/', verifyToken, requireRole('Staff', 'Admin'), borrowController.getAll);

// Độc giả xem phiếu của mình (phải đặt trước /:id để không bị nhầm route)
router.get('/my', verifyToken, requireRole('Reader'), borrowController.getMy);

// Chi tiết phiếu (Staff/Admin/Reader chính chủ)
router.get('/:id', verifyToken, borrowController.getById);

// Độc giả tạo yêu cầu mượn
router.post('/', verifyToken, requireRole('Reader'), borrowController.create);

// Nhân viên duyệt / từ chối
router.patch('/:id/approve', verifyToken, requireRole('Staff', 'Admin'), borrowController.approve);
router.patch('/:id/reject', verifyToken, requireRole('Staff', 'Admin'), borrowController.reject);

// Gia hạn (Reader hoặc Staff hỗ trợ)
router.patch(
    '/:id/details/:detailId/renew',
    verifyToken,
    borrowController.renew
);

// Nhân viên xác nhận trả sách
router.patch(
    '/:id/details/:detailId/return',
    verifyToken,
    requireRole('Staff', 'Admin'),
    borrowController.returnBook
);

module.exports = router;
