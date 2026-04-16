const express = require('express');
const router = express.Router();
const { getPrisma } = require('../db/connection');

router.get('/', async (req, res, next) => {
  try {
    const vendors = await getPrisma().vendor.findMany({ orderBy: { name: 'asc' } });
    res.json(vendors);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const vendor = await getPrisma().vendor.create({ data: { name, email: email || null } });
    res.status(201).json(vendor);
  } catch (err) { next(err); }
});

module.exports = router;
