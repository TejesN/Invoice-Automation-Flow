const { getPrisma } = require('../db/connection');
const { computeStatus } = require('./invoiceService');

async function recordPayment({ invoice_id, amount, payment_date, method, reference, notes }) {
  const prisma = getPrisma();
  const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(invoice_id) } });

  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  const amt = parseFloat(amount);
  const remaining = invoice.amount - invoice.amountPaid;

  if (amt <= 0) {
    const err = new Error('Payment amount must be greater than zero');
    err.status = 400;
    throw err;
  }
  if (amt > remaining + 0.001) {
    const err = new Error(`Payment amount exceeds remaining balance of ${remaining.toFixed(2)}`);
    err.status = 400;
    throw err;
  }

  const newAmountPaid = invoice.amountPaid + amt;
  const newStatus = computeStatus(invoice.amount, newAmountPaid, invoice.dueDate);

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId: parseInt(invoice_id),
        amount: amt,
        paymentDate: payment_date,
        method: method || null,
        reference: reference || null,
        notes: notes || null,
      },
    }),
    prisma.invoice.update({
      where: { id: parseInt(invoice_id) },
      data: { amountPaid: newAmountPaid, status: newStatus },
    }),
  ]);

  return payment;
}

async function deletePayment(id) {
  const prisma = getPrisma();
  const payment = await prisma.payment.findUnique({ where: { id: parseInt(id) } });
  if (!payment) return false;

  const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
  if (!invoice) return false;

  const newAmountPaid = Math.max(0, invoice.amountPaid - payment.amount);
  const newStatus = computeStatus(invoice.amount, newAmountPaid, invoice.dueDate);

  await prisma.$transaction([
    prisma.payment.delete({ where: { id: parseInt(id) } }),
    prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { amountPaid: newAmountPaid, status: newStatus },
    }),
  ]);

  return true;
}

async function listPayments(invoice_id) {
  const prisma = getPrisma();
  return prisma.payment.findMany({
    where: { invoiceId: parseInt(invoice_id) },
    orderBy: { paymentDate: 'desc' },
  });
}

async function listAllPayments({ search } = {}) {
  const prisma = getPrisma();
  const payments = await prisma.payment.findMany({
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          vendor: { select: { name: true } },
        },
      },
    },
    orderBy: { paymentDate: 'desc' },
  });

  if (search) {
    const q = search.toLowerCase();
    return payments.filter(p =>
      p.reference?.toLowerCase().includes(q) ||
      p.invoice?.vendor?.name?.toLowerCase().includes(q) ||
      p.invoice?.invoiceNumber?.toLowerCase().includes(q)
    );
  }

  return payments;
}

module.exports = { recordPayment, deletePayment, listPayments, listAllPayments };
