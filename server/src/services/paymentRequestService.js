const { getPrisma } = require('../db/connection');
const { computeStatus } = require('./invoiceService');

async function createRequest({ invoice_id, amount, payment_date, method, reference, notes, requested_by }) {
  const prisma = getPrisma();
  const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(invoice_id) } });
  if (!invoice) { const e = new Error('Invoice not found'); e.status = 404; throw e; }

  const remaining = invoice.amount - invoice.amountPaid;
  const amt = parseFloat(amount);
  if (amt <= 0) { const e = new Error('Amount must be positive'); e.status = 400; throw e; }
  if (amt > remaining + 0.001) { const e = new Error(`Exceeds remaining balance of ${remaining.toFixed(2)}`); e.status = 400; throw e; }

  return prisma.paymentRequest.create({
    data: {
      invoiceId: parseInt(invoice_id),
      amount: amt,
      paymentDate: payment_date,
      method: method || null,
      reference: reference || null,
      notes: notes || null,
      requestedBy: requested_by || 'clerk',
      status: 'pending',
    },
    include: { invoice: { include: { vendor: { select: { name: true } } } } },
  });
}

async function listRequests({ status } = {}) {
  const prisma = getPrisma();
  return prisma.paymentRequest.findMany({
    where: status ? { status } : undefined,
    include: { invoice: { include: { vendor: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function reviewRequest(id, { status, reviewed_by, review_note }) {
  const prisma = getPrisma();
  const req = await prisma.paymentRequest.findUnique({ where: { id: parseInt(id) } });
  if (!req) { const e = new Error('Request not found'); e.status = 404; throw e; }
  if (req.status !== 'pending') { const e = new Error('Request already reviewed'); e.status = 400; throw e; }

  if (status === 'approved') {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.invoiceId } });
    const newAmountPaid = invoice.amountPaid + req.amount;
    const newStatus = computeStatus(invoice.amount, newAmountPaid, invoice.dueDate);

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: req.invoiceId,
          amount: req.amount,
          paymentDate: req.paymentDate,
          method: req.method,
          reference: req.reference,
          notes: req.notes,
        },
      }),
      prisma.invoice.update({
        where: { id: req.invoiceId },
        data: { amountPaid: newAmountPaid, status: newStatus },
      }),
      prisma.paymentRequest.update({
        where: { id: parseInt(id) },
        data: { status: 'approved', reviewedBy: reviewed_by || null, reviewNote: review_note || null },
      }),
    ]);
  } else {
    await prisma.paymentRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'rejected', reviewedBy: reviewed_by || null, reviewNote: review_note || null },
    });
  }

  return prisma.paymentRequest.findUnique({
    where: { id: parseInt(id) },
    include: { invoice: { include: { vendor: { select: { name: true } } } } },
  });
}

module.exports = { createRequest, listRequests, reviewRequest };
