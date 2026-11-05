import React, { useState } from 'react';
import { formatDateLabel } from '../../utils/formatters';

export interface ChartSeries {
  symbol: string;
  name: string;
  color: string;
  data: number[];
}

interface SvgLineChartProps {
  dates: string[];
  series: ChartSeries[];
  valueFormatter?: (val: number) => string;
  height?: number;
  yAxisLabel?: string;
  baselineValue?: number; // e.g. 100 for normalized base-100 chart
}

export const SvgLineChart: React.FC<SvgLineChartProps> = ({
  dates,
  series,
  valueFormatter = (v) => v.toFixed(2),
  height = 320,
  yAxisLabel,
  baselineValue,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!dates.length || !series.length || !series[0].data.length) {
    return <div className="chart-empty">No historical data available for chart.</div>;
  }

  // Calculate min and max bounds across all series
  let allValues: number[] = [];
  series.forEach((s) => {
    allValues = allValues.concat(s.data);
  });
  if (baselineValue !== undefined) {
    allValues.push(baselineValue);
  }

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const padding = (rawMax - rawMin) * 0.08 || 1;
  const minVal = rawMin - padding;
  const maxVal = rawMax + padding;
  const valRange = maxVal - minVal || 1;

  const width = 800;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 40;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (index: number) => {
    if (dates.length <= 1) return padLeft + chartW / 2;
    return padLeft + (index / (dates.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padTop + chartH - ((val - minVal) / valRange) * chartH;
  };

  // Generate 4 horizontal grid ticks
  const ticksCount = 4;
  const yTicks = Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = minVal + (i / ticksCount) * valRange;
    return { val, y: getY(val) };
  });

  return (
    <div className="svg-chart-wrapper">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="svg-chart"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Y Axis Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padLeft}
              y1={tick.y}
              x2={width - padRight}
              y2={tick.y}
              stroke="#e0e0e0"
              strokeDasharray="4 4"
            />
            <text
              x={padLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="chart-axis-text"
            >
              {valueFormatter(tick.val)}
            </text>
          </g>
        ))}

        {/* Baseline indicator (e.g. 100% line for quarter view) */}
        {baselineValue !== undefined && (
          <g>
            <line
              x1={padLeft}
              y1={getY(baselineValue)}
              x2={width - padRight}
              y2={getY(baselineValue)}
              stroke="#0f62fe"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <text
              x={width - padRight + 5}
              y={getY(baselineValue) + 3}
              className="chart-baseline-text"
            >
              Base ({baselineValue})
            </text>
          </g>
        )}

        {/* X Axis dates */}
        {dates.map((date, idx) => {
          // Show sampled labels if there are many dates
          const step = Math.ceil(dates.length / 6);
          if (idx % step !== 0 && idx !== dates.length - 1) return null;
          const x = getX(idx);
          return (
            <text
              key={idx}
              x={x}
              y={height - 12}
              textAnchor="middle"
              className="chart-axis-text"
            >
              {formatDateLabel(date)}
            </text>
          );
        })}

        {/* Y Axis Label if provided */}
        {yAxisLabel && (
          <text
            x={14}
            y={padTop + 10}
            className="chart-axis-label"
          >
            {yAxisLabel}
          </text>
        )}

        {/* Series Lines & Dots */}
        {series.map((s) => {
          const pathCommands = s.data.map((val, idx) => {
            const x = getX(idx);
            const y = getY(val);
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          }).join(' ');

          const isIbm = s.symbol === 'IBM';

          return (
            <g key={s.symbol}>
              <path
                d={pathCommands}
                fill="none"
                stroke={s.color}
                strokeWidth={isIbm ? 3.5 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="chart-line-path"
              />
              {s.data.map((val, idx) => (
                <circle
                  key={idx}
                  cx={getX(idx)}
                  cy={getY(val)}
                  r={hoveredIndex === idx ? (isIbm ? 6 : 5) : isIbm ? 3.5 : 2.5}
                  fill={s.color}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}

        {/* Hover interaction vertical bar */}
        {dates.map((_, idx) => {
          const x = getX(idx);
          const sliceWidth = chartW / Math.max(dates.length - 1, 1);
          return (
            <rect
              key={idx}
              x={x - sliceWidth / 2}
              y={padTop}
              width={sliceWidth}
              height={chartH}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          );
        })}

        {/* Hover vertical guideline */}
        {hoveredIndex !== null && (
          <line
            x1={getX(hoveredIndex)}
            y1={padTop}
            x2={getX(hoveredIndex)}
            y2={height - padBottom}
            stroke="#525252"
            strokeDasharray="2 2"
          />
        )}
      </svg>

      {/* Tooltip & Legend Card */}
      <div className="chart-legend-row">
        {series.map((s) => {
          const val = hoveredIndex !== null ? s.data[hoveredIndex] : s.data[s.data.length - 1];
          return (
            <div key={s.symbol} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: s.color }}></span>
              <span className="legend-symbol">{s.symbol}:</span>
              <span className="legend-value">{valueFormatter(val)}</span>
            </div>
          );
        })}
        {hoveredIndex !== null && (
          <div className="legend-date-tag">
            Date: {formatDateLabel(dates[hoveredIndex])}
          </div>
        )}
      </div>
    </div>
  );
};
