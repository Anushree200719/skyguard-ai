import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
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
    <div className="relative min-h-screen w-full max-w-full flex flex-col font-poppins bg-black text-slate-100 overflow-x-hidden selection:bg-white selection:text-black">
      {/* ATMOSPHERIC BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none filter grayscale contrast-125 brightness-75 scale-105"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
      />

      {/* SUBTLE DARK GRAYSCALE OVERLAY */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90 z-[1] pointer-events-none backdrop-blur-[2px]" />

      {/* APPLICATION CONTAINER */}
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-full">
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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
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

