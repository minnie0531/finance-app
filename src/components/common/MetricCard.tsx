import React from 'react';
import { StockQuote } from '../../types/finance';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';

interface MetricCardProps {
  quote: StockQuote;
  highlightPrimary?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ quote, highlightPrimary = false }) => {
  const isPositive = quote.change >= 0;
  const isIbm = quote.symbol === 'IBM' || quote.isPrimary || highlightPrimary;

  return (
    <div className={`metric-card ${isIbm ? 'metric-card-primary' : ''}`}>
      <div className="metric-header">
        <div>
          <div className="symbol-row">
            <span className="stock-symbol">{quote.symbol}</span>
            {isIbm && <span className="primary-pill">Benchmark</span>}
          </div>
          <h3 className="stock-name" title={quote.name}>
            {quote.name}
          </h3>
        </div>
        <div className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '▲' : '▼'} {formatPercent(quote.changePercent)}
        </div>
      </div>

      <div className="price-row">
        <span className="current-price">{formatCurrency(quote.price, quote.currency)}</span>
        <span className={`change-absolute ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}
          {quote.change.toFixed(2)}
        </span>
      </div>

      <div className="metric-details-grid">
        <div className="detail-item">
          <span className="detail-label">Open</span>
          <span className="detail-val">{formatCurrency(quote.open, quote.currency)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">High / Low</span>
          <span className="detail-val">
            {quote.high.toFixed(1)} / {quote.low.toFixed(1)}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Volume</span>
          <span className="detail-val">{formatNumber(quote.volume)}</span>
        </div>
      </div>
    </div>
  );
};
