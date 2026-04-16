const { createRequest, listRequests, reviewRequest } = require('../services/paymentRequestService');

async function list(req, res, next) {
  try {
    const { status } = req.query;
    res.json(await listRequests({ status }));
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const { invoice_id, amount, payment_date, method, reference, notes, requested_by } = req.body;
    if (!invoice_id || !amount || !payment_date) {
      return res.status(400).json({ error: 'invoice_id, amount, and payment_date are required' });
    }
    res.status(201).json(await createRequest({ invoice_id, amount, payment_date, method, reference, notes, requested_by }));
  } catch (e) { next(e); }
}

async function review(req, res, next) {
  try {
    const { status, reviewed_by, review_note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be "approved" or "rejected"' });
    }
    res.json(await reviewRequest(req.params.id, { status, reviewed_by, review_note }));
  } catch (e) { next(e); }
}

module.exports = { list, create, review };
