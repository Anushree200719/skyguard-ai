import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Stations } from './pages/Stations';
import { StationDetail } from './pages/StationDetail';
import { AnomalyExplorer } from './pages/AnomalyExplorer';
import { AlertsPage } from './pages/AlertsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LiveSimulator } from './pages/LiveSimulator';
import { FaultInjectorModal } from './components/FaultInjectorModal';
import { fetchStations } from './services/api';

export const App: React.FC = () => {
  const [isFaultModalOpen, setIsFaultModalOpen] = useState<boolean>(false);
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    fetchStations().then(setStations).catch(console.warn);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Header onOpenFaultInjector={() => setIsFaultModalOpen(true)} />

        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/stations/:id" element={<StationDetail />} />
              <Route path="/anomalies" element={<AnomalyExplorer />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/simulator" element={<LiveSimulator />} />
            </Routes>
          </main>
        </div>

        <FaultInjectorModal
          isOpen={isFaultModalOpen}
          onClose={() => setIsFaultModalOpen(false)}
          stations={stations}
        />
      </div>
    </Router>
  );
};

export default App;
