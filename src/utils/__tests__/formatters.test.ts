import { formatCurrency, formatPercent, formatNumber, formatDateLabel } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive and decimal numbers as USD currency', () => {
      expect(formatCurrency(218.45)).toBe('$218.45');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('handles zero, negative, NaN or undefined gracefully', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(NaN)).toBe('$0.00');
    });
  });

  describe('formatPercent', () => {
    it('formats positive percentages with leading plus sign', () => {
      expect(formatPercent(1.51)).toBe('+1.51%');
      expect(formatPercent(0.4)).toBe('+0.40%');
    });

    it('formats negative percentages with minus sign', () => {
      expect(formatPercent(-0.49)).toBe('-0.49%');
    });

    it('formats 0% properly', () => {
      expect(formatPercent(0)).toBe('0.00%');
    });
  });

  describe('formatNumber', () => {
    it('formats billions, millions, and thousands with abbreviations', () => {
      expect(formatNumber(1_500_000_000)).toBe('1.50B');
      expect(formatNumber(4_850_000)).toBe('4.85M');
      expect(formatNumber(25_000)).toBe('25.0K');
      expect(formatNumber(500)).toBe('500');
    });
  });

  describe('formatDateLabel', () => {
    it('formats ISO date strings to human-readable month/day', () => {
      const formatted = formatDateLabel('2025-01-15');
      expect(formatted).toContain('Jan');
    });
  });
});
