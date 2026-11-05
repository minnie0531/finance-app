export type Timeframe = 'CURRENT_DAY' | 'LAST_7_DAYS' | 'LAST_QUARTER';

export interface TimeframeOption {
  id: Timeframe;
  label: string;
  description: string;
}

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  {
    id: 'CURRENT_DAY',
    label: 'Today',
    description: 'Real-time market snapshot & daily changes',
  },
  {
    id: 'LAST_7_DAYS',
    label: 'Last 7 Days',
    description: 'Weekly price movements & comparative trend',
  },
  {
    id: 'LAST_QUARTER',
    label: 'Last Quarter',
    description: '90-day normalized performance comparison',
  },
];
