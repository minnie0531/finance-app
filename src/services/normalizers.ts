import {
  StockQuote,
  CompanyHistory,
  MultiCompanyHistoricalData,
  HistoricalDataPoint,
  TrendSummary,
  CompanyRegistry,
} from '../types/finance';
import { YahooChartResponse } from '../api/yahooFinanceClient';

/**
 * Normalizes raw quote data from API, proxy, or fallback objects into a consistent StockQuote
 */
export function normalizeQuote(raw: any, fallbackSymbol: string, fallbackName?: string): StockQuote {
  const symbol = (raw?.symbol || fallbackSymbol).toUpperCase().trim();
  const profile = CompanyRegistry.get(symbol);
  const name =
    raw?.shortName ||
    raw?.longName ||
    raw?.name ||
    profile?.name ||
    fallbackName ||
    symbol;

  const price = Number(raw?.regularMarketPrice ?? raw?.price ?? raw?.currentPrice ?? 0);
  const change = Number(raw?.regularMarketChange ?? raw?.change ?? 0);
  const changePercent = Number(
    raw?.regularMarketChangePercent ??
      raw?.changePercent ??
      (raw?.open && raw.open > 0 ? ((price - raw.open) / raw.open) * 100 : 0)
  );

  return {
    symbol,
    name,
    price: Number.isFinite(price) ? price : 0,
    change: Number.isFinite(change) ? change : 0,
    changePercent: Number.isFinite(changePercent) ? changePercent : 0,
    open: Number(raw?.regularMarketOpen ?? raw?.open ?? price),
    high: Number(raw?.regularMarketDayHigh ?? raw?.high ?? price),
    low: Number(raw?.regularMarketDayLow ?? raw?.low ?? price),
    volume: Number(raw?.regularMarketVolume ?? raw?.volume ?? 0),
    currency: raw?.currency || 'USD',
    timestamp: raw?.regularMarketTime ? raw.regularMarketTime * 1000 : raw?.timestamp || Date.now(),
    isPrimary: symbol === 'IBM',
  };
}

/**
 * Normalizes a raw Yahoo Finance v8 chart response into a clean StockQuote
 */
export function normalizeYahooChartQuote(
  yahooData: YahooChartResponse,
  fallbackSymbol: string
): StockQuote | null {
  const result = yahooData?.chart?.result?.[0];
  if (!result || !result.meta) return null;

  const meta = result.meta;
  const symbol = (meta.symbol || fallbackSymbol).toUpperCase();
  const price = meta.regularMarketPrice ?? 0;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change = price - prevClose;
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

  const quoteIndicators = result.indicators?.quote?.[0];
  const lastIndex = (quoteIndicators?.close?.length || 1) - 1;

  const open = quoteIndicators?.open?.[0] ?? price;
  const high = quoteIndicators?.high ? Math.max(...quoteIndicators.high.filter(Number.isFinite)) : price;
  const low = quoteIndicators?.low ? Math.min(...quoteIndicators.low.filter(Number.isFinite)) : price;
  const volume = quoteIndicators?.volume?.[lastIndex] ?? 0;

  return normalizeQuote(
    {
      symbol,
      regularMarketPrice: price,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketOpen: open,
      regularMarketDayHigh: high,
      regularMarketDayLow: low,
      regularMarketVolume: volume,
      currency: meta.currency || 'USD',
      regularMarketTime: meta.regularMarketTime,
    },
    symbol
  );
}

/**
 * Normalizes a raw Yahoo Finance chart response into historical daily points for a company
 */
export function normalizeYahooChartHistory(
  yahooData: YahooChartResponse,
  fallbackSymbol: string
): CompanyHistory | null {
  const result = yahooData?.chart?.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
    return null;
  }

  const symbol = (result.meta?.symbol || fallbackSymbol).toUpperCase();
  const profile = CompanyRegistry.get(symbol) || CompanyRegistry.register(symbol);
  const timestamps = result.timestamp;
  const closes = result.indicators.quote[0].close;

  const points: HistoricalDataPoint[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const rawClose = closes[i];
    if (rawClose !== null && rawClose !== undefined && Number.isFinite(rawClose)) {
      const dateStr = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);
      points.push({
        date: dateStr,
        close: parseFloat(rawClose.toFixed(2)),
      });
    }
  }

  if (!points.length) return null;

  return {
    symbol: profile.symbol,
    name: profile.name,
    color: profile.color,
    points,
  };
}

/**
 * Normalizes multi-company historical datasets into base-100 aligned indices for equitable comparison
 */
export function normalizeMultiCompanyHistory(
  histories: CompanyHistory[]
): MultiCompanyHistoricalData {
  if (!histories.length) {
    return { dates: [], series: [] };
  }

  // Find dataset with most complete dates
  const sortedByPoints = [...histories].sort((a, b) => b.points.length - a.points.length);
  const dates = sortedByPoints[0].points.map((p) => p.date);

  const series = histories.map((hist) => {
    const basePrice = hist.points.length > 0 && hist.points[0].close > 0 ? hist.points[0].close : 1;
    const values: number[] = [];
    const normalizedValues: number[] = [];

    dates.forEach((date, index) => {
      const match = hist.points.find((p) => p.date === date) || hist.points[index];
      const price = match ? match.close : basePrice;
      values.push(price);
      // Base-100 calculation: (Current Price / Base Price) * 100
      const norm = parseFloat(((price / basePrice) * 100).toFixed(2));
      normalizedValues.push(norm);
    });

    return {
      symbol: hist.symbol,
      name: hist.name,
      color: hist.color,
      values,
      normalizedValues,
    };
  });

  return { dates, series };
}

/**
 * Calculates key statistical trend metrics across a historical dataset
 */
export function calculateTrendSummary(history: CompanyHistory): TrendSummary {
  const pts = history.points;
  if (!pts || pts.length === 0) {
    return {
      symbol: history.symbol,
      name: history.name,
      color: history.color,
      startPrice: 0,
      endPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      netChange: 0,
      percentChange: 0,
      volatility: 0,
    };
  }

  const startPrice = pts[0].close;
  const endPrice = pts[pts.length - 1].close;
  const values = pts.map((p) => p.close);
  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  const netChange = parseFloat((endPrice - startPrice).toFixed(2));
  const percentChange = startPrice > 0 ? parseFloat((((endPrice - startPrice) / startPrice) * 100).toFixed(2)) : 0;

  // Calculate standard deviation / volatility
  const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const volatility = parseFloat(Math.sqrt(variance).toFixed(2));

  return {
    symbol: history.symbol,
    name: history.name,
    color: history.color,
    startPrice,
    endPrice,
    minPrice,
    maxPrice,
    netChange,
    percentChange,
    volatility,
  };
}

/**
 * Adds base-100 normalized index directly to historical points of a single company
 */
export function normalizeHistoricalPoints(points: HistoricalDataPoint[]): HistoricalDataPoint[] {
  if (!points.length) return [];
  const base = points[0].close > 0 ? points[0].close : 1;
  return points.map((pt) => ({
    ...pt,
    normalizedValue: parseFloat(((pt.close / base) * 100).toFixed(2)),
  }));
}
