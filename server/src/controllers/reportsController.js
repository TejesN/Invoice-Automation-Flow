const { getMonthlySpend, getPaymentTrends, exportData } = require('../services/reportsService');

async function monthlySpend(req, res, next) {
  try { res.json(await getMonthlySpend()); } catch (e) { next(e); }
}

async function paymentTrends(req, res, next) {
  try { res.json(await getPaymentTrends()); } catch (e) { next(e); }
}

async function exportReport(req, res, next) {
  try {
    const format = req.query.format === 'excel' ? 'excel' : 'csv';
    const { data, contentType, filename } = await exportData(format);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  } catch (e) { next(e); }
}

module.exports = { monthlySpend, paymentTrends, exportReport };
