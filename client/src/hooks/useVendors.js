import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';

export function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/vendors').then(setVendors).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { vendors, loading, reload: load };
}
