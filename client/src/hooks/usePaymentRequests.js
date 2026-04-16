import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';

export function usePaymentRequests({ status } = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : '';
      setRequests(await api.get(`/payment-requests${qs}`));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function approve(id, reviewNote = '') {
    await api.patch(`/payment-requests/${id}`, { status: 'approved', review_note: reviewNote });
    load();
  }

  async function reject(id, reviewNote = '') {
    await api.patch(`/payment-requests/${id}`, { status: 'rejected', review_note: reviewNote });
    load();
  }

  return { requests, loading, reload: load, approve, reject };
}
