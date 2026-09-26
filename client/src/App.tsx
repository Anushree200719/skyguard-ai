import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { TickerBar } from './components/TickerBar';
import { LoginModal } from './components/LoginModal';
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
import { Shield, Building2, ExternalLink, Lock, AlertTriangle, Info, LogIn } from 'lucide-react';

const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-slate-100 text-slate-900 overflow-x-hidden font-sans">
      {/* 1. APPLICATION HEADER */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* 2. SCROLLING INFORMATION TICKER BAR */}
      <TickerBar />

      {/* 3. MAIN CONTAINER WITH SIDEBAR & CONTENT */}
      <div className="flex flex-1 relative w-full max-w-full min-w-0 overflow-x-hidden">
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* BREADCRUMBS BAR */}
          <Breadcrumbs />

          {/* MAIN PAGE CONTENT */}
          <main className="flex-1 main-content-area px-3 sm:px-4 md:px-6 pb-6 overflow-y-auto w-full max-w-full overflow-x-hidden min-w-0">
            <Outlet />
          </main>

          {/* 4. GOVERNMENT-STYLE STRUCTURED FOOTER */}
          <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-500 pt-8 pb-6 px-4 md:px-8 mt-auto select-none">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 text-xs">
              {/* Col 1: Identity */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded bg-blue-900 border border-amber-400 text-amber-400 flex items-center justify-center font-serif font-bold text-sm">
                    🇮🇳
                  </div>
                  <div>
                    <h3 className="font-bold text-white tracking-wide text-sm">SKYGUARD AI</h3>
                    <p className="text-[10px] text-amber-300">Automatic Weather Station Data Quality & Trust Infrastructure</p>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                  AI-assisted platform for real-time validation, anomaly detection, WMO No. 8 rule checks, and spatial consensus verification across Indian Automatic Weather Stations.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-700/60 text-amber-300 rounded text-[10px] font-mono">
                  <Info className="w-3 h-3 text-amber-400" /> PROJECT STATUS: ACADEMIC / DEMONSTRATION PROJECT
                </div>
              </div>

              {/* Col 2: Quick Links */}
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-800 pb-1.5 text-amber-400">
                  Quick Links
                </h4>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li><Link to="/dashboard" className="hover:text-amber-400 transition-colors">National Dashboard</Link></li>
                  <li><Link to="/stations" className="hover:text-amber-400 transition-colors">AWS Network Directory</Link></li>
                  <li><Link to="/monitoring" className="hover:text-amber-400 transition-colors">Live Weather Observations</Link></li>
                  <li><Link to="/anomalies" className="hover:text-amber-400 transition-colors">Data Quality Control</Link></li>
                  <li><Link to="/alerts" className="hover:text-amber-400 transition-colors">Alert & Warning Center</Link></li>
                  <li><Link to="/analytics" className="hover:text-amber-400 transition-colors">Reports & Analytics</Link></li>
                </ul>
              </div>

              {/* Col 3: Information */}
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-800 pb-1.5 text-amber-400">
                  Information & Legal
                </h4>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li><a href="#about" className="hover:text-amber-400 transition-colors">About SkyGuard AI</a></li>
                  <li><a href="#accessibility" className="hover:text-amber-400 transition-colors">Accessibility Options</a></li>
                  <li><a href="#privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#terms" className="hover:text-amber-400 transition-colors">Terms of Usage</a></li>
                  <li><a href="#contact" className="hover:text-amber-400 transition-colors">Technical Helpdesk</a></li>
                </ul>
              </div>

              {/* Col 4: System Specs */}
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-800 pb-1.5 text-amber-400">
                  System Info
                </h4>
                <ul className="space-y-1 text-slate-400 font-mono text-[10px]">
                  <li><span className="text-slate-500">Version:</span> v2.4.0-GOV</li>
                  <li><span className="text-slate-500">QC Protocol:</span> WMO No. 8</li>
                  <li><span className="text-slate-500">ML Models:</span> IsoForest + LSTM</li>
                  <li><span className="text-slate-500">Spatial Consensus:</span> Active</li>
                  <li><span className="text-slate-500">Status:</span> 982/1008 Active</li>
                </ul>
              </div>
            </div>

            {/* Bottom Disclaimer Banner */}
            <div className="max-w-7xl mx-auto pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  © 2026 SkyGuard AI — Automatic Weather Station Data Quality & Trust Portal.
                </span>
              </div>
              <div className="text-[10px] text-amber-300 font-medium text-center md:text-right">
                "This website is a demonstration/academic project and is not an official Government of India website unless formally authorized."
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* LOGIN MODAL */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
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

