import { FinanceService } from '../financeService';
import { CompanyRegistry } from '../../types/finance';

describe('FinanceService', () => {
  beforeEach(() => {
    FinanceService.clearCache();
    CompanyRegistry.resetToDefaults();
  });

  it('fetches a single quote for IBM benchmark', async () => {
    const quote = await FinanceService.fetchQuote('IBM');
    expect(quote.symbol).toBe('IBM');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.isPrimary).toBe(true);
  });

  it('fetches all default tracked companies quotes', async () => {
    const quotes = await FinanceService.fetchAllQuotes();
    expect(quotes.length).toBeGreaterThanOrEqual(5);
    const symbols = quotes.map((q) => q.symbol);
    expect(symbols).toContain('IBM');
    expect(symbols).toContain('MSFT');
    expect(symbols).toContain('ORCL');
    expect(symbols).toContain('SAP');
    expect(symbols).toContain('CRM');
  });

  it('fetches 7-day multi-company history', async () => {
    const history = await FinanceService.fetchMultiCompanyHistory(['IBM', 'MSFT'], 7);
    expect(history.dates.length).toBe(7);
    expect(history.series.length).toBe(2);
    expect(history.series[0].values.length).toBe(7);
    expect(history.series[0].normalizedValues.length).toBe(7);
  });

  it('fetches complete trend summary metrics for 90 days', async () => {
    const summary = await FinanceService.fetchTrendSummary('IBM', 90);
    expect(summary.symbol).toBe('IBM');
    expect(summary.startPrice).toBeGreaterThan(0);
    expect(summary.endPrice).toBeGreaterThan(0);
    expect(summary.minPrice).toBeLessThanOrEqual(summary.maxPrice);
    expect(summary.volatility).toBeGreaterThanOrEqual(0);
  });

  it('allows registering a new company dynamically and fetching its data', async () => {
    FinanceService.registerCompany('GOOGL', 'Alphabet Inc.', '#ea4335');
    const symbols = FinanceService.getTrackedSymbols();
    expect(symbols).toContain('GOOGL');

    const quote = await FinanceService.fetchQuote('GOOGL');
    expect(quote.symbol).toBe('GOOGL');
    expect(quote.name).toBe('Alphabet Inc.');
    expect(quote.price).toBeGreaterThan(0);
  });
});
