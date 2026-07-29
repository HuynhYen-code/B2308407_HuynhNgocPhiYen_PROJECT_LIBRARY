const express = require('express');
const router = express.Router();
const bookCopyController = require('../controllers/book-copy.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', verifyToken, requireRole('Staff', 'Admin'), bookCopyController.getAll);
router.get('/:id', verifyToken, requireRole('Staff', 'Admin'), bookCopyController.getById);
router.post('/', verifyToken, requireRole('Staff', 'Admin'), bookCopyController.create);
router.put('/:id', verifyToken, requireRole('Staff', 'Admin'), bookCopyController.update);
router.delete('/:id', verifyToken, requireRole('Admin'), bookCopyController.remove);

module.exports = router;
