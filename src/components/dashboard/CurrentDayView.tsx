import React from 'react';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';
import { MetricCard } from '../common/MetricCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';

export const CurrentDayView: React.FC = () => {
  const { quotes, loading, error, refetch } = useMarketQuotes();

  if (loading) {
    return <LoadingSpinner message="Fetching today's market quotes for IBM and competitors..." />;
  }

  if (error) {
    return (
      <div className="error-banner">
        <span>⚠️ {error}</span>
        <button onClick={refetch} className="btn-retry-inline">
          Retry
        </button>
      </div>
    );
  }

  const ibmQuote = quotes.find((q) => q.symbol === 'IBM');
  const competitorQuotes = quotes.filter((q) => q.symbol !== 'IBM');

  // Calculate market stats
  const sortedByChange = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  const topGainer = sortedByChange[0];
  const avgChange = quotes.length > 0
    ? quotes.reduce((acc, q) => acc + q.changePercent, 0) / quotes.length
    : 0;

  return (
    <div className="view-container">
      <div className="view-header-strip">
        <div>
          <h2>Today's Market Snapshot</h2>
          <p>Real-time quotes, intraday movements, and benchmark comparison</p>
        </div>
        <div className="market-status-pill">
          <span className="live-indicator"></span> Market Open
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="kpi-strip">
        <div className="kpi-card">
          <span className="kpi-label">Benchmark (IBM) Today</span>
          <span className={`kpi-val ${(ibmQuote?.changePercent || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(ibmQuote?.changePercent || 0)}
          </span>
          <span className="kpi-sub">
            {ibmQuote ? formatCurrency(ibmQuote.price) : '-'}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Top Intraday Gainer</span>
          <span className="kpi-val positive">
            {topGainer ? `${topGainer.symbol} (${formatPercent(topGainer.changePercent)})` : '-'}
          </span>
          <span className="kpi-sub">{topGainer?.name || '-'}</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Peer Group Average Move</span>
          <span className={`kpi-val ${avgChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(avgChange)}
          </span>
          <span className="kpi-sub">{quotes.length} Companies Tracked</span>
        </div>
      </div>

      {/* Featured Primary Benchmark Card */}
      {ibmQuote && (
        <div className="featured-section">
          <h3 className="section-title">Primary Benchmark</h3>
          <MetricCard quote={ibmQuote} highlightPrimary={true} />
        </div>
      )}

      {/* Competitor Grid */}
      <div className="competitors-section">
        <h3 className="section-title">Key Competitors (4 Enterprise Tech Peers)</h3>
        <div className="metric-cards-grid">
          {competitorQuotes.map((q) => (
            <MetricCard key={q.symbol} quote={q} />
          ))}
        </div>
      </div>

      {/* Quick Summary Table */}
      <div className="table-card">
        <h3 className="section-title">Intraday Summary Matrix</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Symbol</th>
              <th>Current Price</th>
              <th>Day Range</th>
              <th>Volume</th>
              <th>Today's Change</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const isPositive = q.change >= 0;
              const isIbm = q.symbol === 'IBM';
              return (
                <tr key={q.symbol} className={isIbm ? 'row-benchmark' : ''}>
                  <td>
                    <div className="table-company-cell">
                      <strong>{q.name}</strong>
                      {isIbm && <span className="primary-pill ml-2">Benchmark</span>}
                    </div>
                  </td>
                  <td><code>{q.symbol}</code></td>
                  <td><strong>{formatCurrency(q.price, q.currency)}</strong></td>
                  <td>{q.low.toFixed(1)} - {q.high.toFixed(1)}</td>
                  <td>{formatNumber(q.volume)}</td>
                  <td className={isPositive ? 'positive' : 'negative'}>
                    <strong>
                      {isPositive ? '+' : ''}
                      {q.change.toFixed(2)} ({formatPercent(q.changePercent)})
                    </strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
