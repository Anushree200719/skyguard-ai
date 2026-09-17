import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Stations } from './pages/Stations';
import { RankingsPage } from './pages/RankingsPage';
import { StationDetail } from './pages/StationDetail';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { AnomalyExplorer } from './pages/AnomalyExplorer';
import { AlertsPage } from './pages/AlertsPage';
import { HistoricalAnalysisPage } from './pages/HistoricalAnalysisPage';
import { PredictionPage } from './pages/PredictionPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col font-sans bg-[#070a12] text-slate-100 overflow-x-hidden">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />

      <div className="flex flex-1 relative w-full max-w-full min-w-0 overflow-x-hidden">
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />

        <main className="flex-1 main-content-area p-3 sm:p-4 md:p-6 overflow-y-auto w-full max-w-full overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Full-screen Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Application Command Center Layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/stations/:id" element={<StationDetail />} />
          <Route path="/monitoring" element={<LiveMonitoring />} />
          <Route path="/anomalies" element={<AnomalyExplorer />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/history" element={<HistoricalAnalysisPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

