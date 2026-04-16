const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentRequestController');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.review);

module.exports = router;
