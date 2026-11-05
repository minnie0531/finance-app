import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomCompanySection } from '../dashboard/CustomCompanySection';
import { FinanceService } from '../../services/financeService';

describe('CustomCompanySection Component', () => {
  beforeEach(() => {
    FinanceService.clearCache();
  });

  it('renders section title, search input, and popular ticker chips', async () => {
    render(<CustomCompanySection />);

    expect(screen.getByText(/Custom Company Analysis/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter ticker/i)).toBeInTheDocument();
    expect(screen.getByText('Popular Tickers:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'NVDA' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GOOGL' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/Apple Inc./i).length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByRole('button', { name: /Analyze Ticker/i })).toBeInTheDocument();
  });

  it('allows clicking quick ticker chip to load company stock graph', async () => {
    render(<CustomCompanySection />);

    await waitFor(() => {
      expect(screen.getAllByText(/Apple Inc./i).length).toBeGreaterThanOrEqual(1);
    });

    const nvdaChip = screen.getByRole('button', { name: 'NVDA' });
    fireEvent.click(nvdaChip);

    await waitFor(() => {
      expect(screen.getAllByText(/NVIDIA Corporation/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('allows searching for a ticker symbol via input form', async () => {
    render(<CustomCompanySection />);

    await waitFor(() => {
      expect(screen.getAllByText(/Apple Inc./i).length).toBeGreaterThanOrEqual(1);
    });

    const input = screen.getByPlaceholderText(/Enter ticker/i);
    const submitBtn = screen.getByRole('button', { name: /Analyze Ticker/i });

    fireEvent.change(input, { target: { value: 'GOOGL' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Alphabet Inc./i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays a clear error notice when entering an unknown/unsupported ticker with no data', async () => {
    render(<CustomCompanySection />);

    await waitFor(() => {
      expect(screen.getAllByText(/Apple Inc./i).length).toBeGreaterThanOrEqual(1);
    });

    const input = screen.getByPlaceholderText(/Enter ticker/i);
    const submitBtn = screen.getByRole('button', { name: /Analyze Ticker/i });

    fireEvent.change(input, { target: { value: 'UNKNOWN_TICKER_XYZ' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Data Retrieval Notice/i)).toBeInTheDocument();
      expect(
        screen.getByText(/No market data found for ticker symbol 'UNKNOWN_TICKER_XYZ'/i)
      ).toBeInTheDocument();
    });
  });

  it('displays validation error if empty ticker is submitted', async () => {
    render(<CustomCompanySection />);

    await waitFor(() => {
      expect(screen.getAllByText(/Apple Inc./i).length).toBeGreaterThanOrEqual(1);
    });

    const input = screen.getByPlaceholderText(/Enter ticker/i);
    const submitBtn = screen.getByRole('button', { name: /Analyze Ticker/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid stock ticker symbol/i)).toBeInTheDocument();
    });
  });

  it('allows toggling timeframe between 7-Day and Quarter', async () => {
    render(<CustomCompanySection />);

    await waitFor(() => {
      expect(screen.getByText(/7-Day Return/i)).toBeInTheDocument();
    });

    const quarterBtn = screen.getByRole('button', { name: /Quarter \(90D\)/i });
    fireEvent.click(quarterBtn);

    await waitFor(() => {
      expect(screen.getByText(/90-Day Return/i)).toBeInTheDocument();
    });
  });
});
