import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Link } from 'react-router-dom';
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
import { Shield, Building2, ExternalLink, Lock } from 'lucide-react';

const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-slate-100 text-slate-900 overflow-x-hidden">
      {/* APPLICATION HEADER */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 relative w-full max-w-full min-w-0 overflow-x-hidden">
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <main className="flex-1 main-content-area p-3 sm:p-4 md:p-6 overflow-y-auto w-full max-w-full overflow-x-hidden min-w-0">
            <Outlet />
          </main>

          {/* OFFICIAL GOVERNMENT FOOTER */}
          <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-600 pt-8 pb-6 px-4 md:px-8 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                    S
                  </div>
                  <div>
                    <h3 className="font-bold text-white tracking-wide text-sm">SKYGUARD AI</h3>
                    <p className="text-[10px] text-slate-400">National AWS Trust Portal</p>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                  AI-Powered Quality Control & Spatial Consensus Infrastructure for Automatic Weather Stations across India.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 text-amber-400 rounded text-[10px] font-mono">
                  <Lock className="w-3 h-3" /> OFFICIAL MONITORING SYSTEM
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-800 pb-1.5">
                  Core Modules
                </h4>
                <ul className="space-y-1.5 text-slate-400">
                  <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">National AWS Overview</Link></li>
                  <li><Link to="/stations" className="hover:text-blue-400 transition-colors">AWS Station Directory</Link></li>
                  <li><Link to="/monitoring" className="hover:text-blue-400 transition-colors">Live Telemetry Feeds</Link></li>
                  <li><Link to="/anomalies" className="hover:text-blue-400 transition-colors">Anomaly & SHAP Audit</Link></li>
                  <li><Link to="/alerts" className="hover:text-blue-400 transition-colors">Warning & Alert Center</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-800 pb-1.5">
                  Technical Specs
                </h4>
                <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
                  <li><span className="text-slate-500">ML Engine:</span> PyTorch LSTM & IsoForest</li>
                  <li><span className="text-slate-500">QC Protocol:</span> WMO No. 8 Standard</li>
                  <li><span className="text-slate-500">Spatial Check:</span> Haversine Distance Engine</li>
                  <li><span className="text-slate-500">Data Stream:</span> Socket.IO & Open-Meteo</li>
                  <li><span className="text-slate-500">Security:</span> Role-Based Access Control</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-800 pb-1.5">
                  Institutional Disclaimer
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                  Maintained by SkyGuard AI Operations Team. All telemetry processed through automated rule checks and spatial consensus validation.
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Build: v2.4.0-GOV | Node: Active | ML Core: Operational
                </p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>© 2026 SkyGuard AI — National Automatic Weather Station Quality Control System</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="#accessibility" className="hover:text-white">Accessibility</a>
                <a href="#privacy" className="hover:text-white">Privacy Policy</a>
                <a href="#terms" className="hover:text-white">Terms of Usage</a>
                <a href="#help" className="hover:text-white">Technical Desk</a>
              </div>
            </div>
          </footer>
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
