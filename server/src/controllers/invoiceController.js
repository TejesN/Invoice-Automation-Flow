const { listInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } = require('../services/invoiceService');

async function list(req, res, next) {
  try {
    const { status, vendor_id, search, sort, order, page, limit } = req.query;
    const result = await listInvoices({
      status, vendor_id, search, sort, order,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json(result);
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { vendor_id, invoice_number, amount, issue_date, due_date, notes, currency, exchange_rate } = req.body;
    if (!vendor_id || !invoice_number || !amount || !issue_date || !due_date) {
      return res.status(400).json({ error: 'vendor_id, invoice_number, amount, issue_date, and due_date are required' });
    }
    const invoice = await createInvoice({ vendor_id, invoice_number, amount, issue_date, due_date, notes, currency, exchange_rate });
    res.status(201).json(invoice);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const invoice = await updateInvoice(req.params.id, req.body);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const deleted = await deleteInvoice(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { list, get, create, update, remove };
