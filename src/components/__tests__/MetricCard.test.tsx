import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../common/MetricCard';
import { StockQuote } from '../../types/finance';

describe('MetricCard Component', () => {
  const mockQuote: StockQuote = {
    symbol: 'IBM',
    name: 'International Business Machines',
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
  };

  it('renders symbol, name, price, and formatted change percent', () => {
    render(<MetricCard quote={mockQuote} />);
    expect(screen.getByText('IBM')).toBeInTheDocument();
    expect(screen.getByText('International Business Machines')).toBeInTheDocument();
    expect(screen.getByText('$218.45')).toBeInTheDocument();
    expect(screen.getByText(/1.51%/)).toBeInTheDocument();
    expect(screen.getByText('Benchmark')).toBeInTheDocument();
  });
});
