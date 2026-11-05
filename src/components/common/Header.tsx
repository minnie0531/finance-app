import React from 'react';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing = false }) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-badge">IBM</div>
        <div>
          <h1 className="header-title">Finance Market Dashboard</h1>
          <p className="header-subtitle">IBM & Competitor Analytics (Yahoo Finance Data)</p>
        </div>
      </div>
      <div className="header-actions">
        {onRefresh && (
          <button
            className={`btn-refresh ${isRefreshing ? 'rotating' : ''}`}
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Market Data"
          >
            ↻ Refresh
          </button>
        )}
      </div>
    </header>
  );
};
