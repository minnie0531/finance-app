import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartCard } from '../charts/ChartCard';

describe('ChartCard Component', () => {
  it('renders title, subtitle, badge, and children', () => {
    render(
      <ChartCard
        title="Sample Trend"
        subtitle="Last 7 Days Analysis"
        badge="Live"
        footer={<div>Footer Content</div>}
      >
        <div data-testid="chart-child">Chart Graphic</div>
      </ChartCard>
    );

    expect(screen.getByText('Sample Trend')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days Analysis')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByTestId('chart-child')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });
});
