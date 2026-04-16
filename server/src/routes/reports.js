const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportsController');

router.get('/monthly-spend', ctrl.monthlySpend);
router.get('/payment-trends', ctrl.paymentTrends);
router.get('/export', ctrl.exportReport);

module.exports = router;
