const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', verifyToken, requireRole('Admin'), staffController.getAll);
router.get('/:id', verifyToken, requireRole('Admin'), staffController.getById);
router.post('/', verifyToken, requireRole('Admin'), staffController.create);
router.put('/:id', verifyToken, requireRole('Admin'), staffController.update);
router.delete('/:id', verifyToken, requireRole('Admin'), staffController.remove);

module.exports = router;
