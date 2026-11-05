import React from 'react';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ChartCard } from '../charts/ChartCard';
import { SvgLineChart } from '../charts/SvgLineChart';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatPercent } from '../../utils/formatters';

export const QuarterView: React.FC = () => {
  const { data, loading, error, refetch } = useHistoricalData(90);

  if (loading) {
    return <LoadingSpinner message="Aggregating 90-day quarterly market trends and base-100 normalization..." />;
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

  // Base-100 normalized series
  const normalizedSeries = data.series.map((s) => ({
    symbol: s.symbol,
    name: s.name,
    color: s.color,
    data: s.normalizedValues,
  }));

  // Calculate high, low, and quarter return for stats table
  const quarterStats = data.series.map((s) => {
    const minPrice = Math.min(...s.values);
    const maxPrice = Math.max(...s.values);
    const startPrice = s.values[0] || 1;
    const endPrice = s.values[s.values.length - 1] || 1;
    const totalReturnPct = ((endPrice - startPrice) / startPrice) * 100;

    return {
      symbol: s.symbol,
      name: s.name,
      color: s.color,
      startPrice,
      endPrice,
      minPrice,
      maxPrice,
      totalReturnPct,
    };
  });

  const sortedQuarterStats = [...quarterStats].sort((a, b) => b.totalReturnPct - a.totalReturnPct);
  const ibmQuarterPerf = quarterStats.find((s) => s.symbol === 'IBM');
  const quarterLeader = sortedQuarterStats[0];
  const avgQuarterReturn = quarterStats.length > 0
    ? quarterStats.reduce((acc, s) => acc + s.totalReturnPct, 0) / quarterStats.length
    : 0;

  return (
    <div className="view-container">
      <div className="view-header-strip">
        <div>
          <h2>Last Quarter (90 Days) Performance View</h2>
          <p>Normalized Base-100 Relative Growth & Historical Volatility</p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="kpi-strip">
        <div className="kpi-card">
          <span className="kpi-label">IBM 90-Day Quarter Return</span>
          <span className={`kpi-val ${(ibmQuarterPerf?.totalReturnPct || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(ibmQuarterPerf?.totalReturnPct || 0)}
          </span>
          <span className="kpi-sub">
            {ibmQuarterPerf ? `$${ibmQuarterPerf.startPrice.toFixed(1)} → $${ibmQuarterPerf.endPrice.toFixed(1)}` : '-'}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Quarter Performance Leader</span>
          <span className="kpi-val positive">
            {quarterLeader ? `${quarterLeader.symbol} (${formatPercent(quarterLeader.totalReturnPct)})` : '-'}
          </span>
          <span className="kpi-sub">{quarterLeader?.name || '-'}</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Peer Group 90-Day Average</span>
          <span className={`kpi-val ${avgQuarterReturn >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(avgQuarterReturn)}
          </span>
          <span className="kpi-sub">{quarterStats.length} Enterprise Peers</span>
        </div>
      </div>

      <ChartCard
        title="Quarterly Relative Performance (Base = 100)"
        subtitle="Each stock is indexed to 100 at the start of the 90-day window for equitable relative growth comparison"
        badge="Indexed Normalized Trend"
        footer={
          <div className="chart-info-note">
            ℹ️ A value of 110 indicates a +10% gain since quarter start, while 90 represents a -10% decline.
          </div>
        }
      >
        <SvgLineChart
          dates={data.dates}
          series={normalizedSeries}
          valueFormatter={(v) => `${v.toFixed(1)}`}
          yAxisLabel="Index (Base 100)"
          baselineValue={100}
          height={340}
        />
      </ChartCard>

      <div className="table-card">
        <h3 className="section-title">Quarterly Return & Range Metrics</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Quarter Low</th>
              <th>Quarter High</th>
              <th>90-Day Range Spread</th>
              <th>Total Quarter Return</th>
            </tr>
          </thead>
          <tbody>
            {sortedQuarterStats.map((item) => {
              const isPositive = item.totalReturnPct >= 0;
              const spread = item.maxPrice - item.minPrice;
              const isIbm = item.symbol === 'IBM';
              return (
                <tr key={item.symbol} className={isIbm ? 'row-benchmark' : ''}>
                  <td>
                    <div className="table-company-cell">
                      <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                      <strong>{item.symbol}</strong> - {item.name}
                      {isIbm && <span className="primary-pill ml-2">Benchmark</span>}
                    </div>
                  </td>
                  <td>${item.minPrice.toFixed(2)}</td>
                  <td>${item.maxPrice.toFixed(2)}</td>
                  <td>${spread.toFixed(2)}</td>
                  <td className={isPositive ? 'positive' : 'negative'}>
                    <strong>{formatPercent(item.totalReturnPct)}</strong>
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
