const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', verifyToken, requireRole('Staff', 'Admin'), categoryController.create);
router.put('/:id', verifyToken, requireRole('Staff', 'Admin'), categoryController.update);
router.delete('/:id', verifyToken, requireRole('Admin'), categoryController.remove);

module.exports = router;
