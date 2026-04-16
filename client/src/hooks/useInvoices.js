import { useState, useEffect } from 'react';
import { api } from '@/api/client';

export function useInvoices(params = {}) {
  const [data, setData] = useState({ invoices: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryString = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();

  async function load() {
    try {
      setLoading(true);
      const result = await api.get(`/invoices${queryString ? '?' + queryString : ''}`);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [queryString]);

  return { ...data, loading, error, reload: load };
}

export function useInvoice(id) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const result = await api.get(`/invoices/${id}`);
      setInvoice(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  return { invoice, loading, error, reload: load };
}
