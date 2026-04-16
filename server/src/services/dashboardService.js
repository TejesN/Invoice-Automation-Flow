const { getPrisma } = require('../db/connection');
const { flagOverdueAll } = require('./invoiceService');

async function getSummary() {
  await flagOverdueAll();
  const prisma = getPrisma();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 7) + '-01';

  const invoices = await prisma.invoice.findMany({
    select: { amount: true, amountPaid: true, status: true },
  });

  let total_outstanding = 0;
  let total_overdue = 0;
  let overdue_count = 0;
  let open_count = 0;
  const statusCounts = {};

  for (const inv of invoices) {
    const balance = inv.amount - inv.amountPaid;
    if (inv.status !== 'paid') {
      total_outstanding += balance;
      open_count++;
    }
    if (inv.status === 'overdue') {
      total_overdue += balance;
      overdue_count++;
    }
    statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
  }

  const paymentsThisMonth = await prisma.payment.aggregate({
    where: { paymentDate: { gte: firstOfMonth } },
    _sum: { amount: true },
  });

  const by_status = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  return {
    total_outstanding,
    total_overdue,
    overdue_count,
    open_count,
    total_invoices: invoices.length,
    paid_this_month: paymentsThisMonth._sum.amount || 0,
    by_status,
  };
}

async function getAging() {
  await flagOverdueAll();
  const prisma = getPrisma();
  const today = new Date().toISOString().split('T')[0];

  const invoices = await prisma.invoice.findMany({
    where: { status: { not: 'paid' } },
    select: { dueDate: true, amount: true, amountPaid: true },
  });

  const buckets = { 'Current': 0, '1-30 days': 0, '31-60 days': 0, '61-90 days': 0, '90+ days': 0 };

  for (const inv of invoices) {
    const balance = inv.amount - inv.amountPaid;
    const diff = Math.floor((new Date(today) - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
    if (diff <= 0) buckets['Current'] += balance;
    else if (diff <= 30) buckets['1-30 days'] += balance;
    else if (diff <= 60) buckets['31-60 days'] += balance;
    else if (diff <= 90) buckets['61-90 days'] += balance;
    else buckets['90+ days'] += balance;
  }

  return Object.entries(buckets).map(([bucket, amount]) => ({ bucket, amount }));
}

module.exports = { getSummary, getAging };
