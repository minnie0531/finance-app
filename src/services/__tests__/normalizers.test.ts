import {
  normalizeQuote,
  normalizeYahooChartQuote,
  normalizeYahooChartHistory,
  normalizeMultiCompanyHistory,
  normalizeHistoricalPoints,
  calculateTrendSummary,
} from '../normalizers';
import { YahooChartResponse } from '../../api/yahooFinanceClient';

describe('normalizers', () => {
  describe('normalizeQuote', () => {
    it('normalizes valid raw quote payload', () => {
      const raw = {
        symbol: 'ibm',
        shortName: 'IBM Corp',
        regularMarketPrice: 218.45,
        regularMarketChange: 3.25,
        regularMarketChangePercent: 1.51,
        regularMarketOpen: 215.8,
        regularMarketDayHigh: 219.9,
        regularMarketDayLow: 215.1,
        regularMarketVolume: 4850000,
        currency: 'USD',
      };

      const result = normalizeQuote(raw, 'IBM');
      expect(result.symbol).toBe('IBM');
      expect(result.price).toBe(218.45);
      expect(result.change).toBe(3.25);
      expect(result.changePercent).toBe(1.51);
      expect(result.isPrimary).toBe(true);
    });

    it('handles empty or malformed objects with safe defaults', () => {
      const result = normalizeQuote(null, 'MSFT', 'Microsoft Corp.');
      expect(result.symbol).toBe('MSFT');
      expect(result.name).toBe('Microsoft Corp.');
      expect(result.price).toBe(0);
      expect(result.change).toBe(0);
      expect(result.isPrimary).toBe(false);
    });
  });

  describe('normalizeYahooChartQuote', () => {
    it('correctly parses Yahoo v8 chart json structure into StockQuote', () => {
      const mockYahooResp: YahooChartResponse = {
        chart: {
          result: [
            {
              meta: {
                currency: 'USD',
                symbol: 'IBM',
                regularMarketTime: 1730000000,
                regularMarketPrice: 220.5,
                chartPreviousClose: 217.5,
              },
              timestamp: [1730000000],
              indicators: {
                quote: [
                  {
                    open: [218.0],
                    high: [221.0],
                    low: [217.0],
                    close: [220.5],
                    volume: [5000000],
                  },
                ],
              },
            },
          ],
          error: null,
        },
      };

      const quote = normalizeYahooChartQuote(mockYahooResp, 'IBM');
      expect(quote).not.toBeNull();
      expect(quote?.symbol).toBe('IBM');
      expect(quote?.price).toBe(220.5);
      expect(quote?.change).toBe(3.0);
      expect(quote?.currency).toBe('USD');
    });
  });

  describe('normalizeYahooChartHistory', () => {
    it('parses timestamps and close prices into daily points', () => {
      const mockYahooResp: YahooChartResponse = {
        chart: {
          result: [
            {
              meta: {
                currency: 'USD',
                symbol: 'IBM',
                regularMarketTime: 1730000000,
                regularMarketPrice: 220.5,
                chartPreviousClose: 217.5,
              },
              timestamp: [1730000000, 1730086400],
              indicators: {
                quote: [
                  {
                    open: [218.0, 220.0],
                    high: [221.0, 222.0],
                    low: [217.0, 219.0],
                    close: [220.5, 221.8],
                    volume: [5000000, 4800000],
                  },
                ],
              },
            },
          ],
          error: null,
        },
      };

      const history = normalizeYahooChartHistory(mockYahooResp, 'IBM');
      expect(history).not.toBeNull();
      expect(history?.symbol).toBe('IBM');
      expect(history?.points.length).toBe(2);
      expect(history?.points[0].close).toBe(220.5);
      expect(history?.points[1].close).toBe(221.8);
    });
  });

  describe('normalizeMultiCompanyHistory', () => {
    it('normalizes multiple company histories to base-100', () => {
      const histories = [
        {
          symbol: 'IBM',
          name: 'IBM',
          color: '#0f62fe',
          points: [
            { date: '2025-01-01', close: 100 },
            { date: '2025-01-02', close: 110 },
          ],
        },
        {
          symbol: 'MSFT',
          name: 'MSFT',
          color: '#0078d4',
          points: [
            { date: '2025-01-01', close: 200 },
            { date: '2025-01-02', close: 190 },
          ],
        },
      ];

      const result = normalizeMultiCompanyHistory(histories);
      expect(result.dates).toEqual(['2025-01-01', '2025-01-02']);
      expect(result.series).toHaveLength(2);

      // IBM: 100 -> 110 => 100, 110
      expect(result.series[0].normalizedValues).toEqual([100, 110]);
      // MSFT: 200 -> 190 => 100, 95
      expect(result.series[1].normalizedValues).toEqual([100, 95]);
    });
  });

  describe('calculateTrendSummary', () => {
    it('computes net change, percent change, min, max, and volatility', () => {
      const history = {
        symbol: 'IBM',
        name: 'IBM',
        color: '#0f62fe',
        points: [
          { date: '2025-01-01', close: 100 },
          { date: '2025-01-02', close: 110 },
          { date: '2025-01-03', close: 105 },
        ],
      };

      const summary = calculateTrendSummary(history);
      expect(summary.symbol).toBe('IBM');
      expect(summary.startPrice).toBe(100);
      expect(summary.endPrice).toBe(105);
      expect(summary.minPrice).toBe(100);
      expect(summary.maxPrice).toBe(110);
      expect(summary.netChange).toBe(5);
      expect(summary.percentChange).toBe(5);
      expect(summary.volatility).toBeGreaterThan(0);
    });
  });

  describe('normalizeHistoricalPoints', () => {
    it('calculates base-100 indexed points for a single company', () => {
      const points = [
        { date: '2025-01-01', close: 50 },
        { date: '2025-01-02', close: 75 },
      ];
      const normalized = normalizeHistoricalPoints(points);
      expect(normalized[0].normalizedValue).toBe(100);
      expect(normalized[1].normalizedValue).toBe(150);
    });
  });
});
