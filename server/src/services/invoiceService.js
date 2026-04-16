const { getPrisma } = require('../db/connection');

function computeStatus(amount, amountPaid, dueDate) {
  const today = new Date().toISOString().split('T')[0];
  if (amountPaid >= amount) return 'paid';
  if (amountPaid > 0 && dueDate >= today) return 'partial';
  if (amountPaid < amount && dueDate < today) return 'overdue';
  return 'pending';
}

async function flagOverdueAll() {
  const prisma = getPrisma();
  const today = new Date().toISOString().split('T')[0];
  // Use raw SQL because Prisma doesn't support column-to-column comparisons in where
  await prisma.$executeRaw`
    UPDATE invoices
    SET status = 'overdue', updated_at = datetime('now')
    WHERE amount_paid < amount
      AND due_date < ${today}
      AND status NOT IN ('paid', 'overdue')
  `;
}

async function listInvoices({ status, vendor_id, search, sort = 'createdAt', order = 'desc', page = 1, limit = 20 } = {}) {
  await flagOverdueAll();
  const prisma = getPrisma();

  const where = {};
  if (status) where.status = status;
  if (vendor_id) where.vendorId = parseInt(vendor_id);
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search } },
      { vendor: { name: { contains: search } } },
    ];
  }

  const allowedSort = ['createdAt', 'dueDate', 'amount', 'status', 'invoiceNumber'];
  const sortField = allowedSort.includes(sort) ? sort : 'createdAt';

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { vendor: { select: { name: true } } },
      orderBy: { [sortField]: order === 'asc' ? 'asc' : 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  const formatted = invoices.map(inv => ({
    ...inv,
    vendor_name: inv.vendor.name,
    vendor: undefined,
  }));

  return { invoices: formatted, total, page, limit };
}

async function getInvoiceById(id) {
  const prisma = getPrisma();
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      vendor: { select: { name: true, email: true } },
      payments: { orderBy: { paymentDate: 'desc' } },
    },
  });

  if (!invoice) return null;

  return {
    ...invoice,
    vendor_name: invoice.vendor.name,
    vendor_email: invoice.vendor.email,
  };
}

async function createInvoice({ vendor_id, invoice_number, amount, issue_date, due_date, notes, currency = 'USD', exchange_rate = 1.0 }) {
  const prisma = getPrisma();
  const status = computeStatus(amount, 0, due_date);
  const invoice = await prisma.invoice.create({
    data: {
      vendorId: parseInt(vendor_id),
      invoiceNumber: invoice_number,
      amount: parseFloat(amount),
      amountPaid: 0,
      dueDate: due_date,
      issueDate: issue_date,
      status,
      notes: notes || null,
      currency: currency || 'USD',
      exchangeRate: currency === 'USD' ? 1.0 : parseFloat(exchange_rate) || 1.0,
    },
  });
  return getInvoiceById(invoice.id);
}

async function updateInvoice(id, fields) {
  const prisma = getPrisma();
  const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(id) } });
  if (!invoice) return null;

  const data = {};
  if (fields.invoice_number !== undefined) data.invoiceNumber = fields.invoice_number;
  if (fields.amount !== undefined) data.amount = parseFloat(fields.amount);
  if (fields.due_date !== undefined) data.dueDate = fields.due_date;
  if (fields.issue_date !== undefined) data.issueDate = fields.issue_date;
  if (fields.notes !== undefined) data.notes = fields.notes;
  if (fields.vendor_id !== undefined) data.vendorId = parseInt(fields.vendor_id);
  if (fields.currency !== undefined) data.currency = fields.currency;
  if (fields.exchange_rate !== undefined) data.exchangeRate = fields.currency === 'USD' ? 1.0 : parseFloat(fields.exchange_rate);

  const newAmount = data.amount !== undefined ? data.amount : invoice.amount;
  const newDueDate = data.dueDate !== undefined ? data.dueDate : invoice.dueDate;
  data.status = computeStatus(newAmount, invoice.amountPaid, newDueDate);

  await prisma.invoice.update({ where: { id: parseInt(id) }, data });
  return getInvoiceById(id);
}

async function deleteInvoice(id) {
  const prisma = getPrisma();
  try {
    await prisma.payment.deleteMany({ where: { invoiceId: parseInt(id) } });
    await prisma.invoice.delete({ where: { id: parseInt(id) } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { computeStatus, flagOverdueAll, listInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice };
