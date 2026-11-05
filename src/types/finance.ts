export interface CompanyProfile {
  symbol: string;
  name: string;
  color: string;
  isPrimary?: boolean;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  currency: string;
  timestamp: number;
  isPrimary?: boolean;
}

export interface HistoricalDataPoint {
  date: string;
  close: number;
  normalizedValue?: number; // Base 100 relative index for comparison
}

export interface CompanyHistory {
  symbol: string;
  name: string;
  color: string;
  points: HistoricalDataPoint[];
}

export interface MultiCompanyHistoricalData {
  dates: string[];
  series: {
    symbol: string;
    name: string;
    color: string;
    values: number[]; // parallel to dates
    normalizedValues: number[]; // base-100 indexed to first valid point
  }[];
}

export interface TrendSummary {
  symbol: string;
  name: string;
  color: string;
  startPrice: number;
  endPrice: number;
  minPrice: number;
  maxPrice: number;
  netChange: number;
  percentChange: number;
  volatility: number;
}

// Built-in color palette for dynamically added companies
export const PALETTE = [
  '#0f62fe', // IBM Blue (Primary)
  '#0078d4', // Microsoft Blue
  '#c74634', // Oracle Red
  '#008fd3', // SAP Cyan
  '#00a1e0', // Salesforce Teal
  '#8a3ffc', // Purple
  '#ff832b', // Orange
  '#198038', // Green
  '#ee5396', // Magenta
  '#005d5d', // Teal-Dark
];

export const DEFAULT_TRACKED_COMPANIES: CompanyProfile[] = [
  { symbol: 'IBM', name: 'IBM Corp.', color: '#0f62fe', isPrimary: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', color: '#0078d4' },
  { symbol: 'ORCL', name: 'Oracle Corp.', color: '#c74634' },
  { symbol: 'SAP', name: 'SAP SE', color: '#008fd3' },
  { symbol: 'CRM', name: 'Salesforce Inc.', color: '#00a1e0' },
];

/**
 * Dynamic registry to manage tracked tickers easily across the app
 */
export class CompanyRegistry {
  private static companies: Map<string, CompanyProfile> = new Map(
    DEFAULT_TRACKED_COMPANIES.map((c) => [c.symbol.toUpperCase(), { ...c }])
  );

  public static getAll(): CompanyProfile[] {
    return Array.from(this.companies.values());
  }

  public static getSymbols(): string[] {
    return Array.from(this.companies.keys());
  }

  public static get(symbol: string): CompanyProfile | undefined {
    return this.companies.get(symbol.toUpperCase());
  }

  public static register(symbol: string, name?: string, color?: string): CompanyProfile {
    const upper = symbol.toUpperCase().trim();
    if (this.companies.has(upper)) {
      const existing = this.companies.get(upper)!;
      if (name) existing.name = name;
      if (color) existing.color = color;
      return existing;
    }

    const assignedColor =
      color || PALETTE[this.companies.size % PALETTE.length] || '#3b82d4';

    const newProfile: CompanyProfile = {
      symbol: upper,
      name: name || `${upper} Inc.`,
      color: assignedColor,
      isPrimary: upper === 'IBM',
    };

    this.companies.set(upper, newProfile);
    return newProfile;
  }

  public static unregister(symbol: string): boolean {
    const upper = symbol.toUpperCase();
    if (upper === 'IBM') return false; // Guard benchmark
    return this.companies.delete(upper);
  }

  public static resetToDefaults(): void {
    this.companies = new Map(
      DEFAULT_TRACKED_COMPANIES.map((c) => [c.symbol.toUpperCase(), { ...c }])
    );
  }
}
