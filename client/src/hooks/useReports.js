import { useState, useEffect } from 'react';
import { api } from '@/api/client';

export function useReports() {
  const [monthlySpend, setMonthlySpend] = useState([]);
  const [paymentTrends, setPaymentTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [spend, trends] = await Promise.all([
          api.get('/reports/monthly-spend'),
          api.get('/reports/payment-trends'),
        ]);

        // Pivot monthly spend: [{ month, vendor_name, total }] → [{ month, VendorA: n, VendorB: n }]
        const vendors = [...new Set(spend.map(r => r.vendor_name))];
        const byMonth = {};
        for (const row of spend) {
          if (!byMonth[row.month]) byMonth[row.month] = { month: row.month };
          byMonth[row.month][row.vendor_name] = row.total;
        }
        const pivoted = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

        setMonthlySpend({ data: pivoted, vendors });
        setPaymentTrends(trends);
      } catch {
        setMonthlySpend({ data: [], vendors: [] });
        setPaymentTrends([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { monthlySpend, paymentTrends, loading };
}
