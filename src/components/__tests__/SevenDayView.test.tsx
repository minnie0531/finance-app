import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SevenDayView } from '../dashboard/SevenDayView';

describe('SevenDayView Rendering Path', () => {
  it('renders 7-day trend chart, KPI stats, and performance ranking table', async () => {
    render(<SevenDayView />);

    await waitFor(() => {
      expect(screen.getByText('Last 7 Days Trend Comparison')).toBeInTheDocument();
    });

    expect(screen.getByText('IBM 7-Day Net Return')).toBeInTheDocument();
    expect(screen.getByText('7-Day Top Outperformer')).toBeInTheDocument();
    expect(screen.getByText('7-Day Closing Price Movements (USD)')).toBeInTheDocument();
    expect(screen.getByText('7-Day Performance Ranking')).toBeInTheDocument();

    // Verify presence of tracked tickers in ranking table
    expect(screen.getAllByText('IBM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('MSFT').length).toBeGreaterThanOrEqual(1);
  });
});
