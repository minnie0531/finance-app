import { useState, useEffect, useCallback } from 'react';
import { StockQuote } from '../types/finance';
import { FinanceService } from '../services/financeService';

export function useMarketQuotes(symbols?: string[]) {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FinanceService.fetchAllQuotes(symbols);
      setQuotes(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch market quotes');
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  return { quotes, loading, error, refetch: loadQuotes };
}
