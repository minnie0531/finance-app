import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CurrentDayView } from '../dashboard/CurrentDayView';

describe('CurrentDayView Rendering Path', () => {
  it('renders loading state initially and then displays market snapshot and cards', async () => {
    render(<CurrentDayView />);

    // Check header and live pill
    await waitFor(() => {
      expect(screen.getByText("Today's Market Snapshot")).toBeInTheDocument();
      expect(screen.getByText('Market Open')).toBeInTheDocument();
    });

    // Verify benchmark and competitor cards
    expect(screen.getByText('Primary Benchmark')).toBeInTheDocument();
    expect(screen.getByText('Key Competitors (4 Enterprise Tech Peers)')).toBeInTheDocument();

    // Verify company symbols exist in document
    expect(screen.getAllByText('IBM').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('MSFT').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('ORCL').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SAP').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CRM').length).toBeGreaterThanOrEqual(1);

    // Verify summary table headers
    expect(screen.getByText('Intraday Summary Matrix')).toBeInTheDocument();
    expect(screen.getByText("Today's Change")).toBeInTheDocument();
  });
});
