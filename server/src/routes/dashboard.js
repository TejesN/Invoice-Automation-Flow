const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');

router.get('/summary', ctrl.summary);
router.get('/aging', ctrl.aging);

module.exports = router;
