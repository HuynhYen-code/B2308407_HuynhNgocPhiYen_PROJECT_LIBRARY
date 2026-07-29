const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.route'));
router.use('/readers', require('./reader.route'));
router.use('/staff', require('./staff.route'));
router.use('/publishers', require('./publisher.route'));
router.use('/categories', require('./category.route'));
router.use('/books', require('./book.route'));
router.use('/book-copies', require('./book-copy.route'));
router.use('/borrows', require('./borrow.route'));
router.use('/notifications', require('./notification.route'));

module.exports = router;
