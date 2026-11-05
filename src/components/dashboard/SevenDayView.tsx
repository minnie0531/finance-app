import React from 'react';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ChartCard } from '../charts/ChartCard';
import { SvgLineChart } from '../charts/SvgLineChart';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const SevenDayView: React.FC = () => {
  const { data, loading, error, refetch } = useHistoricalData(7);

  if (loading) {
    return <LoadingSpinner message="Calculating 7-day comparative price series..." />;
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

  // Transform series data for SvgLineChart
  const chartSeries = data.series.map((s) => ({
    symbol: s.symbol,
    name: s.name,
    color: s.color,
    data: s.values,
  }));

  // Calculate 7-day delta for each symbol
  const performanceSummary = data.series.map((s) => {
    const first = s.values[0] || 0;
    const last = s.values[s.values.length - 1] || 0;
    const change = last - first;
    const changePct = first > 0 ? (change / first) * 100 : 0;
    return {
      symbol: s.symbol,
      name: s.name,
      color: s.color,
      first,
      last,
      change,
      changePct,
    };
  });

  const sortedSummary = [...performanceSummary].sort((a, b) => b.changePct - a.changePct);
  const ibmPerf = performanceSummary.find((s) => s.symbol === 'IBM');
  const topWeeklyGainer = sortedSummary[0];
  const avgWeeklyChange = performanceSummary.length > 0
    ? performanceSummary.reduce((acc, s) => acc + s.changePct, 0) / performanceSummary.length
    : 0;

  return (
    <div className="view-container">
      <div className="view-header-strip">
        <div>
          <h2>Last 7 Days Trend Comparison</h2>
          <p>Closing price trajectories and weekly percentage changes</p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="kpi-strip">
        <div className="kpi-card">
          <span className="kpi-label">IBM 7-Day Net Return</span>
          <span className={`kpi-val ${(ibmPerf?.changePct || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(ibmPerf?.changePct || 0)}
          </span>
          <span className="kpi-sub">
            {ibmPerf ? `${formatCurrency(ibmPerf.first)} → ${formatCurrency(ibmPerf.last)}` : '-'}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">7-Day Top Outperformer</span>
          <span className="kpi-val positive">
            {topWeeklyGainer ? `${topWeeklyGainer.symbol} (${formatPercent(topWeeklyGainer.changePct)})` : '-'}
          </span>
          <span className="kpi-sub">{topWeeklyGainer?.name || '-'}</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Peer Group 7-Day Average</span>
          <span className={`kpi-val ${avgWeeklyChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(avgWeeklyChange)}
          </span>
          <span className="kpi-sub">{performanceSummary.length} Tracked Tickers</span>
        </div>
      </div>

      <ChartCard
        title="7-Day Closing Price Movements (USD)"
        subtitle="Compare daily close prices over the past 7 days across IBM and 4 competitor stocks"
        badge="Multi-Ticker Line View"
      >
        <SvgLineChart
          dates={data.dates}
          series={chartSeries}
          valueFormatter={(v) => formatCurrency(v)}
          yAxisLabel="Price ($)"
          height={340}
        />
      </ChartCard>

      <div className="table-card">
        <h3 className="section-title">7-Day Performance Ranking</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Symbol</th>
              <th>7 Days Ago</th>
              <th>Latest Close</th>
              <th>Net Change</th>
              <th>7-Day % Change</th>
            </tr>
          </thead>
          <tbody>
            {sortedSummary.map((item) => {
              const isPositive = item.changePct >= 0;
              const isIbm = item.symbol === 'IBM';
              return (
                <tr key={item.symbol} className={isIbm ? 'row-benchmark' : ''}>
                  <td>
                    <div className="table-company-cell">
                      <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                      <strong>{item.name}</strong>
                      {isIbm && <span className="primary-pill ml-2">Benchmark</span>}
                    </div>
                  </td>
                  <td><code>{item.symbol}</code></td>
                  <td>{formatCurrency(item.first)}</td>
                  <td>{formatCurrency(item.last)}</td>
                  <td className={isPositive ? 'positive' : 'negative'}>
                    {isPositive ? '+' : ''}
                    {item.change.toFixed(2)}
                  </td>
                  <td className={isPositive ? 'positive' : 'negative'}>
                    <strong>{formatPercent(item.changePct)}</strong>
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
