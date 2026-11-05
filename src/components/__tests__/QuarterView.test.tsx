import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QuarterView } from '../dashboard/QuarterView';

describe('QuarterView Rendering Path', () => {
  it('renders quarterly base-100 chart, quarterly KPIs, and spread stats table', async () => {
    render(<QuarterView />);

    await waitFor(() => {
      expect(screen.getByText('Last Quarter (90 Days) Performance View')).toBeInTheDocument();
    });

    expect(screen.getByText('IBM 90-Day Quarter Return')).toBeInTheDocument();
    expect(screen.getByText('Quarter Performance Leader')).toBeInTheDocument();
    expect(screen.getByText('Quarterly Relative Performance (Base = 100)')).toBeInTheDocument();
    expect(screen.getByText('Quarterly Return & Range Metrics')).toBeInTheDocument();

    // Verify company symbols in quarterly range metrics table
    expect(screen.getAllByText('IBM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('ORCL').length).toBeGreaterThanOrEqual(1);
  });
});
