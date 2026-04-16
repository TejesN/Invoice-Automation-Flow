import { useState, useEffect } from 'react';
import { api } from '@/api/client';

export function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const [s, a] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/aging'),
      ]);
      setSummary(s);
      setAging(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return { summary, aging, loading, error, reload: load };
}
