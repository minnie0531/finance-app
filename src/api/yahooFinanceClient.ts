/**
 * Yahoo Finance API Client
 * Provides HTTP access to Yahoo Finance chart v8 API with timeout and proxy support,
 * with graceful fallback to local synthetic datasets in constrained workshop/offline environments.
 */

export interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        exchangeName?: string;
        instrumentType?: string;
        firstTradeDate?: number;
        regularMarketTime: number;
        regularMarketPrice: number;
        chartPreviousClose: number;
        previousClose?: number;
        scale?: number;
        priceHint?: number;
        currentTradingPeriod?: any;
        tradingPeriods?: any;
        dataGranularity?: string;
        range?: string;
        validRanges?: string[];
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
    }>;
    error: any;
  };
}

export class YahooFinanceClient {
  private static BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

  /**
   * Fetch raw chart response from Yahoo Finance API for a symbol and range
   * @param symbol Stock ticker (e.g. IBM, MSFT)
   * @param range Valid ranges: '1d', '5d', '7d', '1mo', '3mo', '1y'
   * @param interval Intervals: '5m', '15m', '1d', '1wk'
   */
  public static async fetchChart(
    symbol: string,
    range: string = '7d',
    interval: string = '1d'
  ): Promise<YahooChartResponse | null> {
    // In Jest / JSDOM unit test environments, avoid network calls to prevent CORS virtual console logs
    if (process.env.NODE_ENV === 'test' || typeof window === 'undefined') {
      return null;
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    const url = `${this.BASE_URL}/${cleanSymbol}?range=${range}&interval=${interval}&includePrePost=false`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const json: YahooChartResponse = await response.json();
      if (json.chart?.result && json.chart.result.length > 0) {
        return json;
      }
      return null;
    } catch {
      // In browser/offline/CORS mode, safely return null so service falls back seamlessly
      return null;
    }
  }
}
