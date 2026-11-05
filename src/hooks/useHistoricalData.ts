import { useState, useEffect, useCallback } from 'react';
import { MultiCompanyHistoricalData } from '../types/finance';
import { FinanceService } from '../services/financeService';

export function useHistoricalData(days: number = 7, symbols?: string[]) {
  const [data, setData] = useState<MultiCompanyHistoricalData>({ dates: [], series: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await FinanceService.fetchMultiCompanyHistory(symbols, days);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch historical market data');
    } finally {
      setLoading(false);
    }
  }, [days, symbols]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { data, loading, error, refetch: loadHistory };
}
