import React from 'react';
import { Timeframe, TIMEFRAME_OPTIONS } from '../../types/timeframe';

interface TabBarProps {
  activeTab: Timeframe;
  onSelectTab: (tab: Timeframe) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="tab-bar" aria-label="Timeframe Navigation">
      <div className="tab-group">
        {TIMEFRAME_OPTIONS.map((option) => {
          const isActive = activeTab === option.id;
          return (
            <button
              key={option.id}
              className={`tab-btn ${isActive ? 'tab-btn-active' : ''}`}
              onClick={() => onSelectTab(option.id)}
              aria-selected={isActive}
              role="tab"
            >
              <span className="tab-label">{option.label}</span>
              <span className="tab-desc">{option.description}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
