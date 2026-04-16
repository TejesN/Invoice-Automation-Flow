const { getSummary, getAging } = require('../services/dashboardService');

async function summary(req, res, next) {
  try { res.json(await getSummary()); } catch (err) { next(err); }
}

async function aging(req, res, next) {
  try { res.json(await getAging()); } catch (err) { next(err); }
}

module.exports = { summary, aging };
