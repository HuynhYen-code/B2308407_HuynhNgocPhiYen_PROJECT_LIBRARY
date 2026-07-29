const express = require('express');
const router = express.Router();
const readerController = require('../controllers/reader.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

// ── READER: Tự quản lý hồ sơ cá nhân ──────────────────────────
// GET    /api/readers/profile/me  – Xem hồ sơ của chính mình
// POST   /api/readers/profile/me  – Tự đăng ký hồ sơ online (→ ChuaXacMinh)
// PUT    /api/readers/profile/me  – Cập nhật thông tin cá nhân
// (Đặt trước /:id để tránh bị nhầm route)
router.get('/profile/me', verifyToken, readerController.getMyProfile);
router.post('/profile/me', verifyToken, requireRole('Reader'), readerController.selfRegister);
router.put('/profile/me', verifyToken, requireRole('Reader'), readerController.updateMyProfile);

// ── STAFF/ADMIN: Xem & quản lý danh sách ──────────────────────
// GET /api/readers?trangThai=ChuaXacMinh  – Lọc chờ xác minh
router.get('/', verifyToken, requireRole('Staff', 'Admin'), readerController.getAll);
router.get('/:id', verifyToken, requireRole('Staff', 'Admin'), readerController.getById);

// Staff tạo hồ sơ tại quầy (→ DaXacMinh ngay)
router.post('/', verifyToken, requireRole('Staff', 'Admin'), readerController.create);

// Cập nhật thông tin (Staff/Admin)
router.put('/:id', verifyToken, requireRole('Staff', 'Admin'), readerController.update);

// Xác minh hồ sơ (ChuaXacMinh → DaXacMinh)
router.patch('/:id/verify', verifyToken, requireRole('Staff', 'Admin'), readerController.verify);

// Khóa / Mở khóa hồ sơ (DaXacMinh ↔ BiKhoa)
router.patch('/:id/lock', verifyToken, requireRole('Staff', 'Admin'), readerController.lock);

// Xóa hồ sơ (Admin)
router.delete('/:id', verifyToken, requireRole('Admin'), readerController.remove);

module.exports = router;
