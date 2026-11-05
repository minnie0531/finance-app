import React, { useState, useEffect, useCallback } from 'react';
import { FinanceService } from '../../services/financeService';
import { StockQuote, CompanyHistory, TrendSummary } from '../../types/finance';
import { ChartCard } from '../charts/ChartCard';
import { SvgLineChart } from '../charts/SvgLineChart';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';

interface CustomCompanySectionProps {
  refreshKey?: number;
}

const QUICK_TICKERS = ['AAPL', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'];

export const CustomCompanySection: React.FC<CustomCompanySectionProps> = ({ refreshKey = 0 }) => {
  const [inputSymbol, setInputSymbol] = useState<string>('AAPL');
  const [activeSymbol, setActiveSymbol] = useState<string>('AAPL');
  const [timeframeDays, setTimeframeDays] = useState<number>(7);

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<CompanyHistory | null>(null);
  const [trendSummary, setTrendSummary] = useState<TrendSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompanyData = useCallback(async (symbol: string, days: number) => {
    const clean = symbol.trim().toUpperCase();
    if (!clean) {
      setError('Please enter a valid stock ticker symbol.');
      setQuote(null);
      setHistory(null);
      setTrendSummary(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [fetchedQuote, fetchedHistory, fetchedTrend] = await Promise.all([
        FinanceService.fetchQuote(clean),
        FinanceService.fetchHistory(clean, days),
        FinanceService.fetchTrendSummary(clean, days),
      ]);

      setQuote(fetchedQuote);
      setHistory(fetchedHistory);
      setTrendSummary(fetchedTrend);
      setActiveSymbol(clean);
    } catch (err: any) {
      setQuote(null);
      setHistory(null);
      setTrendSummary(null);
      setError(err?.message || `No market data available for ticker symbol '${clean}'.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSymbol) {
      loadCompanyData(activeSymbol, timeframeDays);
    }
  }, [activeSymbol, timeframeDays, refreshKey, loadCompanyData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputSymbol.trim().toUpperCase();
    if (clean) {
      setActiveSymbol(clean);
      loadCompanyData(clean, timeframeDays);
    } else {
      setError('Please enter a valid stock ticker symbol.');
    }
  };

  const handleQuickSelect = (ticker: string) => {
    setInputSymbol(ticker);
    setActiveSymbol(ticker);
    loadCompanyData(ticker, timeframeDays);
  };

  return (
    <section className="custom-company-section" aria-label="User Selected Company Analytics">
      <div className="custom-section-header">
        <div className="custom-header-text">
          <div className="custom-title-badge-row">
            <h2 className="custom-section-title">🔍 Custom Company Analysis</h2>
            <span className="badge-new-feature">Interactive</span>
          </div>
          <p className="custom-section-subtitle">
            Search any company ticker to render an on-demand stock chart and performance breakdown
          </p>
        </div>

        {/* Timeframe switch for the custom graph */}
        <div className="custom-timeframe-switch" role="group" aria-label="Chart Timeframe">
          <button
            type="button"
            className={`pill-btn ${timeframeDays === 7 ? 'active' : ''}`}
            onClick={() => setTimeframeDays(7)}
          >
            7-Day Trend
          </button>
          <button
            type="button"
            className={`pill-btn ${timeframeDays === 90 ? 'active' : ''}`}
            onClick={() => setTimeframeDays(90)}
          >
            Quarter (90D)
          </button>
        </div>
      </div>

      {/* Search Input Bar & Quick Suggestions */}
      <div className="custom-search-container">
        <form onSubmit={handleSubmit} className="custom-search-form" role="search">
          <div className="search-input-group">
            <span className="search-prefix">$</span>
            <input
              type="text"
              className="search-input"
              placeholder="Enter ticker (e.g. AAPL, NVDA, GOOGL, TSLA...)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              aria-label="Stock ticker symbol"
            />
            <button type="submit" className="btn-search-submit" disabled={loading}>
              {loading ? 'Loading...' : 'Analyze Ticker'}
            </button>
          </div>
        </form>

        <div className="quick-tickers-row">
          <span className="quick-label">Popular Tickers:</span>
          {QUICK_TICKERS.map((ticker) => (
            <button
              key={ticker}
              type="button"
              className={`quick-chip ${activeSymbol === ticker ? 'quick-chip-active' : ''}`}
              onClick={() => handleQuickSelect(ticker)}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="custom-content-box">
          <LoadingSpinner message={`Retrieving market series for ${inputSymbol.toUpperCase()}...`} />
        </div>
      )}

      {/* Error / No Data State */}
      {!loading && error && (
        <div className="custom-error-box" role="alert">
          <div className="error-icon">⚠️</div>
          <div className="error-body">
            <strong>Data Retrieval Notice</strong>
            <p className="error-message-text">{error}</p>
            <p className="error-hint">
              Please verify that the ticker is entered correctly or choose one of the suggested companies above.
            </p>
          </div>
        </div>
      )}

      {/* Success / Chart & Metrics Display */}
      {!loading && !error && quote && history && (
        <div className="custom-result-container">
          {/* Company Quick Metrics Banner */}
          <div className="custom-metric-strip">
            <div className="custom-kpi-card">
              <span className="kpi-label">Current Price</span>
              <span className="kpi-val">{formatCurrency(quote.price)}</span>
              <span className={`kpi-sub ${(quote.change || 0) >= 0 ? 'positive' : 'negative'}`}>
                {(quote.change || 0) >= 0 ? '+' : ''}
                {formatCurrency(quote.change)} ({formatPercent(quote.changePercent)}) Today
              </span>
            </div>

            <div className="custom-kpi-card">
              <span className="kpi-label">{timeframeDays === 7 ? '7-Day' : '90-Day'} Return</span>
              <span
                className={`kpi-val ${(trendSummary?.percentChange || 0) >= 0 ? 'positive' : 'negative'}`}
              >
                {formatPercent(trendSummary?.percentChange || 0)}
              </span>
              <span className="kpi-sub">
                {trendSummary ? `${formatCurrency(trendSummary.startPrice)} → ${formatCurrency(trendSummary.endPrice)}` : '-'}
              </span>
            </div>

            <div className="custom-kpi-card">
              <span className="kpi-label">Period Range (Low / High)</span>
              <span className="kpi-val">
                {trendSummary ? `${formatCurrency(trendSummary.minPrice)} - ${formatCurrency(trendSummary.maxPrice)}` : '-'}
              </span>
              <span className="kpi-sub">
                Volatility: {trendSummary ? `${trendSummary.volatility.toFixed(2)}%` : '-'}
              </span>
            </div>

            <div className="custom-kpi-card">
              <span className="kpi-label">Trading Volume</span>
              <span className="kpi-val">{formatNumber(quote.volume)}</span>
              <span className="kpi-sub">{quote.name}</span>
            </div>
          </div>

          {/* User-Selected Company Chart */}
          <ChartCard
            title={`${quote.name} (${quote.symbol}) - ${timeframeDays === 7 ? '7-Day Price Trajectory' : '90-Day Performance'}`}
            subtitle={`Closing price historical movements rendered specifically for ${quote.symbol}`}
            badge={timeframeDays === 7 ? '7D Historical' : '90D Quarterly'}
          >
            <SvgLineChart
              dates={history.points.map((p) => p.date)}
              series={[
                {
                  symbol: history.symbol,
                  name: history.name,
                  color: history.color || '#8a3ffc',
                  data: history.points.map((p) => p.close),
                },
              ]}
              valueFormatter={(v) => formatCurrency(v)}
              yAxisLabel="Price ($)"
              height={300}
            />
          </ChartCard>
        </div>
      )}
    </section>
  );
};

export default CustomCompanySection;
