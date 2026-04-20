const { getPrisma } = require('./connection');

async function seedIfEmpty({ force = false } = {}) {
  const prisma = getPrisma();

  const vendorCount = await prisma.vendor.count();
  if (vendorCount > 0 && !force) {
    console.log('Database already has data — skipping seed.');
    return;
  }

  if (force) {
    console.log('Force reseed — clearing existing data...');
    await prisma.paymentRequest.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.vendor.deleteMany({});
  }

  console.log('Empty database detected — seeding demo data...');

  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const daysAgo  = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };
  const daysAhead = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

  // ── Vendors ──────────────────────────────────────────────────────────────
  const acme = await prisma.vendor.create({ data: { name: 'Acme Supplies', email: 'billing@acme.com' } });
  const tech = await prisma.vendor.create({ data: { name: 'TechParts Inc', email: 'ap@techparts.com' } });
  const glog = await prisma.vendor.create({ data: { name: 'Global Logistics', email: 'invoices@globallogistics.com' } });
  const nova = await prisma.vendor.create({ data: { name: 'Nova Creative', email: 'finance@novacreative.io' } });

  // ── Invoices ─────────────────────────────────────────────────────────────
  const inv1 = await prisma.invoice.create({ data: {
    vendorId: acme.id, invoiceNumber: 'INV-2025-001',
    amount: 5200, amountPaid: 0,
    issueDate: daysAgo(65), dueDate: daysAgo(35),
    status: 'overdue', currency: 'USD', exchangeRate: 1,
    notes: 'Office supplies Q1',
  }});

  const inv2 = await prisma.invoice.create({ data: {
    vendorId: tech.id, invoiceNumber: 'INV-2025-002',
    amount: 12800, amountPaid: 5000,
    issueDate: daysAgo(75), dueDate: daysAgo(45),
    status: 'overdue', currency: 'USD', exchangeRate: 1,
    notes: 'Server hardware batch 1',
  }});

  const inv3 = await prisma.invoice.create({ data: {
    vendorId: glog.id, invoiceNumber: 'INV-2025-003',
    amount: 3400, amountPaid: 0,
    issueDate: daysAgo(20), dueDate: daysAhead(25),
    status: 'pending', currency: 'USD', exchangeRate: 1,
    notes: 'Freight — March shipment',
  }});

  const inv4 = await prisma.invoice.create({ data: {
    vendorId: acme.id, invoiceNumber: 'INV-2025-004',
    amount: 8900, amountPaid: 8900,
    issueDate: daysAgo(50), dueDate: daysAgo(20),
    status: 'paid', currency: 'USD', exchangeRate: 1,
    notes: 'Annual stationery contract',
  }});

  const inv5 = await prisma.invoice.create({ data: {
    vendorId: tech.id, invoiceNumber: 'INV-2025-005',
    amount: 2100, amountPaid: 800,
    issueDate: daysAgo(10), dueDate: daysAhead(20),
    status: 'partial', currency: 'USD', exchangeRate: 1,
    notes: 'Networking equipment',
  }});

  const inv6 = await prisma.invoice.create({ data: {
    vendorId: nova.id, invoiceNumber: 'INV-2025-006',
    amount: 150000, amountPaid: 0,
    issueDate: daysAgo(5), dueDate: daysAhead(25),
    status: 'pending', currency: 'INR', exchangeRate: 0.012,
    notes: 'Brand design package',
  }});

  // ── Payments ──────────────────────────────────────────────────────────────
  // Payments for inv2 (partial)
  await prisma.payment.create({ data: {
    invoiceId: inv2.id, amount: 3000,
    paymentDate: daysAgo(40), method: 'bank_transfer',
    reference: 'TXN-8821', notes: 'First instalment',
  }});
  await prisma.payment.create({ data: {
    invoiceId: inv2.id, amount: 2000,
    paymentDate: daysAgo(20), method: 'wire',
    reference: 'TXN-9104', notes: 'Second instalment',
  }});

  // Full payment for inv4
  await prisma.payment.create({ data: {
    invoiceId: inv4.id, amount: 8900,
    paymentDate: daysAgo(18), method: 'ACH',
    reference: 'TXN-7755', notes: 'Full settlement',
  }});

  // Partial for inv5
  await prisma.payment.create({ data: {
    invoiceId: inv5.id, amount: 800,
    paymentDate: daysAgo(5), method: 'check',
    reference: 'CHQ-1042', notes: 'Advance payment',
  }});

  // ── Payment Requests ──────────────────────────────────────────────────────
  await prisma.paymentRequest.create({ data: {
    invoiceId: inv1.id, amount: 1500,
    paymentDate: daysAhead(3), method: 'bank_transfer',
    reference: 'REQ-2026-001',
    notes: 'Urgent — vendor payment terms expiring this week.',
    requestedBy: 'clerk@demo.com', status: 'pending',
  }});
  await prisma.paymentRequest.create({ data: {
    invoiceId: inv2.id, amount: 3200,
    paymentDate: daysAhead(5), method: 'ACH',
    reference: 'REQ-2026-002',
    notes: 'Monthly recurring settlement.',
    requestedBy: 'clerk@demo.com', status: 'pending',
  }});
  await prisma.paymentRequest.create({ data: {
    invoiceId: inv3.id, amount: 800,
    paymentDate: daysAhead(7), method: 'wire',
    reference: 'REQ-2026-003',
    notes: 'Partial payment to keep account current.',
    requestedBy: 'clerk@demo.com', status: 'approved',
    reviewedBy: 'approver@demo.com', reviewNote: 'Approved — within budget.',
  }});
  await prisma.paymentRequest.create({ data: {
    invoiceId: inv1.id, amount: 500,
    paymentDate: daysAgo(2), method: 'check',
    reference: 'REQ-2026-004',
    notes: 'End-of-month reconciliation payment.',
    requestedBy: 'clerk@demo.com', status: 'rejected',
    reviewedBy: 'approver@demo.com', reviewNote: 'Rejected — duplicate of REQ-2026-001.',
  }});
  await prisma.paymentRequest.create({ data: {
    invoiceId: inv5.id, amount: 1300,
    paymentDate: daysAhead(10), method: 'bank_transfer',
    reference: 'REQ-2026-005',
    notes: 'Q2 advance payment requested by vendor.',
    requestedBy: 'clerk@demo.com', status: 'pending',
  }});

  console.log('Demo data seeded: 4 vendors, 6 invoices, 4 payments, 5 payment requests.');
}

module.exports = { seedIfEmpty };
