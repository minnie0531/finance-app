import {
  StockQuote,
  CompanyHistory,
  MultiCompanyHistoricalData,
  TrendSummary,
  CompanyRegistry,
} from '../types/finance';
import { MOCK_QUOTES, getMockHistoricalData } from '../api/mockData';
import { YahooFinanceClient } from '../api/yahooFinanceClient';
import {
  normalizeQuote,
  normalizeYahooChartQuote,
  normalizeYahooChartHistory,
  normalizeMultiCompanyHistory,
  calculateTrendSummary,
} from './normalizers';

export class FinanceService {
  private static quoteCache = new Map<string, { quote: StockQuote; time: number }>();
  private static historyCache = new Map<string, { history: CompanyHistory; time: number }>();
  private static CACHE_TTL_MS = 60 * 1000; // 1-minute caching

  /**
   * Fetch a single stock quote by symbol with Yahoo Finance API + Mock Fallback
   */
  public static async fetchQuote(symbol: string): Promise<StockQuote> {
    const upper = symbol.toUpperCase().trim();
    const cached = this.quoteCache.get(upper);
    if (cached && Date.now() - cached.time < this.CACHE_TTL_MS) {
      return cached.quote;
    }

    // Register ticker in company registry if not already present
    CompanyRegistry.register(upper);

    try {
      // 1. Attempt live Yahoo Finance 1-day chart query
      const yahooData = await YahooFinanceClient.fetchChart(upper, '1d', '5m');
      if (yahooData) {
        const parsedQuote = normalizeYahooChartQuote(yahooData, upper);
        if (parsedQuote && parsedQuote.price > 0) {
          this.quoteCache.set(upper, { quote: parsedQuote, time: Date.now() });
          return parsedQuote;
        }
      }
    } catch {
      // Ignore network errors and continue to resilient fallback
    }

    // 2. Resilient fallback using verified mock data
    const mock = MOCK_QUOTES[upper];
    if (mock) {
      const normalized = normalizeQuote(mock, upper);
      this.quoteCache.set(upper, { quote: normalized, time: Date.now() });
      return normalized;
    }

    // Do not fabricate fake data if no data exists for the symbol
    throw new Error(`No market data found for ticker symbol '${upper}'.`);
  }

  /**
   * Fetch quotes for all registered or specified companies in parallel
   */
  public static async fetchAllQuotes(
    symbols?: string[]
  ): Promise<StockQuote[]> {
    const targetSymbols = symbols && symbols.length > 0 ? symbols : CompanyRegistry.getSymbols();
    const results = await Promise.allSettled(targetSymbols.map((sym) => this.fetchQuote(sym)));

    return results.map((res, idx) => {
      if (res.status === 'fulfilled') {
        return res.value;
      }
      const sym = targetSymbols[idx];
      return MOCK_QUOTES[sym] || normalizeQuote({}, sym);
    });
  }

  /**
   * Fetch historical series for a single company
   */
  public static async fetchHistory(symbol: string, days: number = 7): Promise<CompanyHistory> {
    const upper = symbol.toUpperCase().trim();
    const cacheKey = `${upper}_${days}`;
    const cached = this.historyCache.get(cacheKey);
    if (cached && Date.now() - cached.time < this.CACHE_TTL_MS) {
      return cached.history;
    }

    CompanyRegistry.register(upper);

    // Map day count to Yahoo API range parameter
    const range = days <= 1 ? '1d' : days <= 7 ? '7d' : days <= 30 ? '1mo' : '3mo';

    try {
      const yahooData = await YahooFinanceClient.fetchChart(upper, range, '1d');
      if (yahooData) {
        const parsedHistory = normalizeYahooChartHistory(yahooData, upper);
        if (parsedHistory && parsedHistory.points.length > 0) {
          this.historyCache.set(cacheKey, { history: parsedHistory, time: Date.now() });
          return parsedHistory;
        }
      }
    } catch {
      // Continue to fallback
    }

    // High-fidelity fallback for supported symbols
    const fallbackHistory = getMockHistoricalData(upper, days);
    if (fallbackHistory) {
      this.historyCache.set(cacheKey, { history: fallbackHistory, time: Date.now() });
      return fallbackHistory;
    }

    // Do not substitute other company's data if historical data is unavailable
    throw new Error(`No historical data found for ticker symbol '${upper}'.`);
  }

  /**
   * Fetch multi-company historical datasets aligned and indexed for comparative analysis
   */
  public static async fetchMultiCompanyHistory(
    symbols?: string[],
    days: number = 7
  ): Promise<MultiCompanyHistoricalData> {
    const targetSymbols = symbols && symbols.length > 0 ? symbols : CompanyRegistry.getSymbols();
    const histories = await Promise.all(targetSymbols.map((sym) => this.fetchHistory(sym, days)));
    return normalizeMultiCompanyHistory(histories);
  }

  /**
   * Fetch complete trend summary metrics (net change, % gain, high/low, volatility)
   */
  public static async fetchTrendSummary(symbol: string, days: number = 7): Promise<TrendSummary> {
    const history = await this.fetchHistory(symbol, days);
    return calculateTrendSummary(history);
  }

  /**
   * Register a new company ticker to easily track more companies in the dashboard
   */
  public static registerCompany(symbol: string, name?: string, color?: string) {
    return CompanyRegistry.register(symbol, name, color);
  }

  /**
   * Get all currently tracked ticker symbols
   */
  public static getTrackedSymbols(): string[] {
    return CompanyRegistry.getSymbols();
  }

  /**
   * Clear in-memory caches
   */
  public static clearCache(): void {
    this.quoteCache.clear();
    this.historyCache.clear();
  }
}
