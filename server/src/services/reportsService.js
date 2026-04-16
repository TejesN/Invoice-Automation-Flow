const { getPrisma } = require('../db/connection');
const XLSX = require('xlsx');

async function getMonthlySpend() {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw`
    SELECT
      strftime('%Y-%m', p.payment_date) AS month,
      v.name AS vendor_name,
      SUM(p.amount * i.exchange_rate) AS total
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    JOIN vendors v ON i.vendor_id = v.id
    WHERE p.payment_date >= date('now', '-12 months')
    GROUP BY month, v.name
    ORDER BY month ASC
  `;
  return rows.map(r => ({ month: r.month, vendor_name: r.vendor_name, total: Number(r.total) }));
}

async function getPaymentTrends() {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw`
    SELECT
      strftime('%Y-%m', p.payment_date) AS month,
      SUM(p.amount * i.exchange_rate) AS total
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE p.payment_date >= date('now', '-12 months')
    GROUP BY month
    ORDER BY month ASC
  `;
  return rows.map(r => ({ month: r.month, total: Number(r.total) }));
}

async function exportData(format) {
  const prisma = getPrisma();
  const invoices = await prisma.invoice.findMany({
    include: { vendor: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });

  const rows = [];
  for (const inv of invoices) {
    const base = {
      'Invoice #': inv.invoiceNumber,
      Vendor: inv.vendor.name,
      'Amount': inv.amount,
      'Currency': inv.currency,
      'Exchange Rate': inv.exchangeRate,
      'USD Equivalent': (inv.amount * inv.exchangeRate).toFixed(2),
      'Amount Paid': inv.amountPaid,
      'Balance': (inv.amount - inv.amountPaid).toFixed(2),
      'Issue Date': inv.issueDate,
      'Due Date': inv.dueDate,
      Status: inv.status,
      Notes: inv.notes || '',
    };
    if (inv.payments.length === 0) {
      rows.push({ ...base, 'Payment Date': '', 'Payment Amount': '', 'Payment Method': '', 'Payment Ref': '' });
    } else {
      for (const pay of inv.payments) {
        rows.push({
          ...base,
          'Payment Date': pay.paymentDate,
          'Payment Amount': pay.amount,
          'Payment Method': pay.method || '',
          'Payment Ref': pay.reference || '',
        });
      }
    }
  }

  if (format === 'csv') {
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    return { data: csv, contentType: 'text/csv', filename: 'ap-export.csv' };
  }

  // Excel
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices & Payments');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return { data: buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ap-export.xlsx' };
}

module.exports = { getMonthlySpend, getPaymentTrends, exportData };
