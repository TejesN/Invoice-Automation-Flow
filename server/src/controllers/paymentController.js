const { recordPayment, deletePayment, listPayments, listAllPayments } = require('../services/paymentService');

async function list(req, res, next) {
  try {
    const { invoice_id, search } = req.query;
    if (invoice_id) {
      res.json(await listPayments(invoice_id));
    } else {
      res.json(await listAllPayments({ search }));
    }
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { invoice_id, amount, payment_date, method, reference, notes } = req.body;
    if (!invoice_id || !amount || !payment_date) {
      return res.status(400).json({ error: 'invoice_id, amount, and payment_date are required' });
    }
    const payment = await recordPayment({ invoice_id, amount, payment_date, method, reference, notes });
    res.status(201).json(payment);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const deleted = await deletePayment(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Payment not found' });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { list, create, remove };
