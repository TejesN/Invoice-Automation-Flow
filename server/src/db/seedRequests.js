const { getPrisma } = require('./connection');

async function seedPaymentRequests() {
  const prisma = getPrisma();

  // Fetch existing invoices that still have a balance remaining
  const invoices = await prisma.invoice.findMany({
    where: { status: { not: 'paid' } },
    include: { vendor: true },
    orderBy: { id: 'asc' },
  });

  if (invoices.length === 0) {
    console.log('No unpaid invoices found — skipping payment request seed.');
    return;
  }

  // Clear existing payment requests so we don't double-seed
  await prisma.paymentRequest.deleteMany({});

  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };
  const daysAhead = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

  // Build requests across available invoices, cycling through them
  const pick = (n) => invoices[n % invoices.length];

  const requests = [
    {
      invoiceId: pick(0).id,
      amount: Math.min(pick(0).amount - pick(0).amountPaid, 1500),
      paymentDate: daysAhead(3),
      method: 'bank_transfer',
      reference: 'REQ-2026-001',
      notes: 'Urgent — vendor payment terms expiring this week.',
      requestedBy: 'clerk@demo.com',
      status: 'pending',
    },
    {
      invoiceId: pick(1).id,
      amount: Math.min(pick(1).amount - pick(1).amountPaid, 3200),
      paymentDate: daysAhead(5),
      method: 'ACH',
      reference: 'REQ-2026-002',
      notes: 'Monthly recurring settlement.',
      requestedBy: 'clerk@demo.com',
      status: 'pending',
    },
    {
      invoiceId: pick(2 % invoices.length).id,
      amount: Math.min(pick(2).amount - pick(2).amountPaid, 800),
      paymentDate: daysAhead(7),
      method: 'wire',
      reference: 'REQ-2026-003',
      notes: 'Partial payment to keep account current.',
      requestedBy: 'clerk@demo.com',
      status: 'approved',
      reviewedBy: 'approver@demo.com',
      reviewNote: 'Approved — within budget.',
    },
    {
      invoiceId: pick(0).id,
      amount: Math.min(pick(0).amount - pick(0).amountPaid, 500),
      paymentDate: daysAgo(2),
      method: 'check',
      reference: 'REQ-2026-004',
      notes: 'End-of-month reconciliation payment.',
      requestedBy: 'clerk@demo.com',
      status: 'rejected',
      reviewedBy: 'approver@demo.com',
      reviewNote: 'Rejected — duplicate request, already covered by REQ-2026-001.',
    },
    {
      invoiceId: pick(1).id,
      amount: Math.min(pick(1).amount - pick(1).amountPaid, 2100),
      paymentDate: daysAhead(10),
      method: 'bank_transfer',
      reference: 'REQ-2026-005',
      notes: 'Q2 advance payment requested by vendor.',
      requestedBy: 'clerk@demo.com',
      status: 'pending',
    },
  ].filter(r => r.amount > 0);

  for (const req of requests) {
    await prisma.paymentRequest.create({ data: req });
  }

  console.log(`Seeded ${requests.length} payment requests.`);
}

seedPaymentRequests()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
