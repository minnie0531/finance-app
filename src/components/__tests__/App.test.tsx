import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

describe('App Component', () => {
  it('renders application title and tabs', async () => {
    render(<App />);
    expect(screen.getByText('Finance Market Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last Quarter')).toBeInTheDocument();

    // Wait for initial load to finish cleanly
    await waitFor(() => {
      expect(screen.getByText(/Today's Market Snapshot/i)).toBeInTheDocument();
    });
  });

  it('allows switching tabs between Today, Last 7 Days, and Last Quarter', async () => {
    render(<App />);

    // Switch to Last 7 Days tab
    const sevenDayTab = screen.getByRole('tab', { name: /Last 7 Days/i });
    fireEvent.click(sevenDayTab);
    expect(await screen.findByText(/7-Day Closing Price Movements/i)).toBeInTheDocument();

    // Switch to Last Quarter tab
    const quarterTab = screen.getByRole('tab', { name: /Last Quarter/i });
    fireEvent.click(quarterTab);
    expect(await screen.findByText(/Quarterly Relative Performance/i)).toBeInTheDocument();
  });
});
