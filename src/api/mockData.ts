import { StockQuote, CompanyHistory, CompanyRegistry } from '../types/finance';

export const MOCK_QUOTES: Record<string, StockQuote> = {
  IBM: {
    symbol: 'IBM',
    name: 'International Business Machines Corp.',
    price: 218.45,
    change: 3.25,
    changePercent: 1.51,
    open: 215.8,
    high: 219.9,
    low: 215.1,
    volume: 4850000,
    currency: 'USD',
    timestamp: Date.now(),
    isPrimary: true,
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 422.85,
    change: -2.1,
    changePercent: -0.49,
    open: 425.0,
    high: 426.5,
    low: 420.7,
    volume: 18920000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  ORCL: {
    symbol: 'ORCL',
    name: 'Oracle Corporation',
    price: 172.6,
    change: 1.85,
    changePercent: 1.08,
    open: 171.0,
    high: 173.5,
    low: 170.2,
    volume: 8430000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  SAP: {
    symbol: 'SAP',
    name: 'SAP SE ADR',
    price: 236.1,
    change: 0.95,
    changePercent: 0.4,
    open: 235.0,
    high: 237.2,
    low: 234.5,
    volume: 1200000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  CRM: {
    symbol: 'CRM',
    name: 'Salesforce, Inc.',
    price: 288.75,
    change: -1.45,
    changePercent: -0.5,
    open: 290.5,
    high: 292.0,
    low: 287.1,
    volume: 5320000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 224.23,
    change: 2.15,
    changePercent: 0.97,
    open: 222.5,
    high: 225.1,
    low: 221.8,
    volume: 48920000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 168.42,
    change: 1.82,
    changePercent: 1.09,
    open: 166.8,
    high: 169.5,
    low: 166.2,
    volume: 24100000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 135.58,
    change: 4.25,
    changePercent: 3.24,
    open: 131.5,
    high: 136.2,
    low: 130.8,
    volume: 62450000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 186.49,
    change: -0.85,
    changePercent: -0.45,
    open: 187.5,
    high: 188.4,
    low: 185.2,
    volume: 31200000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  META: {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 582.01,
    change: 6.45,
    changePercent: 1.12,
    open: 576.2,
    high: 585.0,
    low: 574.8,
    volume: 14500000,
    currency: 'USD',
    timestamp: Date.now(),
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 242.84,
    change: -3.6,
    changePercent: -1.46,
    open: 246.0,
    high: 248.5,
    low: 240.2,
    volume: 58300000,
    currency: 'USD',
    timestamp: Date.now(),
  },
};

// Helper to generate past dates
export function generateDateSeries(daysCount: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// 7-day realistic mock prices
const SEVEN_DAY_PRICES: Record<string, number[]> = {
  IBM: [211.2, 212.8, 214.1, 213.5, 216.0, 217.1, 218.45],
  MSFT: [430.5, 428.2, 427.0, 429.1, 425.4, 424.0, 422.85],
  ORCL: [168.0, 169.5, 170.1, 169.8, 171.2, 171.9, 172.6],
  SAP: [231.0, 232.5, 234.0, 233.2, 235.1, 235.8, 236.1],
  CRM: [295.0, 293.2, 291.5, 292.0, 289.4, 290.1, 288.75],
  AAPL: [218.5, 220.1, 219.4, 221.8, 223.2, 222.9, 224.23],
  GOOGL: [163.2, 164.8, 165.5, 166.1, 167.3, 166.9, 168.42],
  NVDA: [126.4, 128.9, 131.2, 130.5, 133.8, 134.2, 135.58],
  AMZN: [188.2, 187.5, 186.8, 188.1, 185.9, 187.2, 186.49],
  META: [565.0, 569.2, 572.8, 574.1, 578.5, 580.4, 582.01],
  TSLA: [251.2, 248.5, 245.0, 246.8, 244.1, 241.5, 242.84],
};

// 90-day base prices and volatility simulation
const QUARTER_BASE_PRICES: Record<string, { start: number; drift: number }> = {
  IBM: { start: 185.0, drift: 0.38 },
  MSFT: { start: 405.0, drift: 0.2 },
  ORCL: { start: 140.0, drift: 0.36 },
  SAP: { start: 195.0, drift: 0.45 },
  CRM: { start: 260.0, drift: 0.32 },
  AAPL: { start: 190.0, drift: 0.39 },
  GOOGL: { start: 145.0, drift: 0.26 },
  NVDA: { start: 98.0, drift: 0.42 },
  AMZN: { start: 168.0, drift: 0.21 },
  META: { start: 480.0, drift: 1.14 },
  TSLA: { start: 210.0, drift: 0.37 },
};

export function hasMockDataForSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase().trim();
  return Boolean(MOCK_QUOTES[upper] || SEVEN_DAY_PRICES[upper] || QUARTER_BASE_PRICES[upper]);
}

export function getMockHistoricalData(symbol: string, days: number): CompanyHistory | null {
  const upper = symbol.toUpperCase().trim();
  if (!hasMockDataForSymbol(upper)) {
    return null;
  }

  const profile = CompanyRegistry.get(upper) || CompanyRegistry.register(upper);
  const dates = generateDateSeries(days);
  let points: { date: string; close: number }[] = [];

  if (days <= 7 && SEVEN_DAY_PRICES[upper]) {
    const prices = SEVEN_DAY_PRICES[upper];
    points = dates.map((date, idx) => ({
      date,
      close: prices[idx] ?? prices[prices.length - 1],
    }));
  } else {
    // Generate deterministic trend for stability in tests/demos
    const config = QUARTER_BASE_PRICES[upper] || {
      start: 100 + (upper.charCodeAt(0) % 50),
      drift: 0.15,
    };
    let current = config.start;
    points = dates.map((date, idx) => {
      const sinOffset = Math.sin(idx * 0.4) * 2.5;
      const cosOffset = Math.cos(idx * 0.2) * 1.5;
      current += config.drift + sinOffset * 0.1;
      return {
        date,
        close: parseFloat((current + cosOffset).toFixed(2)),
      };
    });
  }

  return {
    symbol: profile.symbol,
    name: profile.name,
    color: profile.color,
    points,
  };
}
