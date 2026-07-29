const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/publisher.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', publisherController.getAll);
router.get('/:id', publisherController.getById);
router.post('/', verifyToken, requireRole('Staff', 'Admin'), publisherController.create);
router.put('/:id', verifyToken, requireRole('Staff', 'Admin'), publisherController.update);
router.delete('/:id', verifyToken, requireRole('Admin'), publisherController.remove);

module.exports = router;
