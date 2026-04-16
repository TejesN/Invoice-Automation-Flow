const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/invoiceController');
const { uploadSingle } = require('../middleware/upload');
const { extract } = require('../controllers/extractController');

// Must be before /:id routes
router.post('/extract', uploadSingle, extract);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
