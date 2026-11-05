import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  footer,
}) => {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title-row">
            <h2 className="chart-card-title">{title}</h2>
            {badge && <span className="chart-card-badge">{badge}</span>}
          </div>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="chart-card-body">{children}</div>
      {footer && <div className="chart-card-footer">{footer}</div>}
    </div>
  );
};
