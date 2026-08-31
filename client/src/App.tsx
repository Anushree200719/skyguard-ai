import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Stations } from './pages/Stations';
import { StationDetail } from './pages/StationDetail';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { AnomalyExplorer } from './pages/AnomalyExplorer';
import { AlertsPage } from './pages/AlertsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-[#070a12] text-slate-100">
        <Header />

        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/stations/:id" element={<StationDetail />} />
              <Route path="/monitoring" element={<LiveMonitoring />} />
              <Route path="/anomalies" element={<AnomalyExplorer />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
