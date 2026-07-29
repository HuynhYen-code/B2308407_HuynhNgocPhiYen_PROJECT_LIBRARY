const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

// GET public (không cần đăng nhập)
router.get('/', bookController.getAll);
router.get('/:id', bookController.getById);

// Quản lý (Staff/Admin)
router.post('/', verifyToken, requireRole('Staff', 'Admin'), bookController.create);
router.put('/:id', verifyToken, requireRole('Staff', 'Admin'), bookController.update);
router.delete('/:id', verifyToken, requireRole('Admin'), bookController.remove);

module.exports = router;
