import React, { useState } from 'react';
import { Timeframe } from './types/timeframe';
import { Header } from './components/common/Header';
import { TabBar } from './components/common/TabBar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CurrentDayView } from './components/dashboard/CurrentDayView';
import { SevenDayView } from './components/dashboard/SevenDayView';
import { QuarterView } from './components/dashboard/QuarterView';
import './App.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Timeframe>('CURRENT_DAY');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="app-wrapper">
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <main className="app-main">
        <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />

        <ErrorBoundary key={`${activeTab}-${refreshKey}`} fallbackMessage="Failed to render selected dashboard view.">
          {activeTab === 'CURRENT_DAY' && <CurrentDayView />}
          {activeTab === 'LAST_7_DAYS' && <SevenDayView />}
          {activeTab === 'LAST_QUARTER' && <QuarterView />}
        </ErrorBoundary>
      </main>

      <footer className="app-footer">
        <p>IBM Bob GitHub SDLC Workshop • Market Analytics Platform</p>
      </footer>
    </div>
  );
};

export default App;
