import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Radio, 
  CloudSun, 
  LineChart, 
  Search, 
  Bell, 
  Wrench, 
  BrainCircuit, 
  Calendar, 
  Trophy,
  ChevronRight,
  Layers
} from 'lucide-react';
import { socket } from '../services/socket';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const navigationModules = [
    { to: '/dashboard', label: 'Command Center Dashboard', desc: 'Main telemetry overview & station status', icon: Shield },
    { to: '/stations', label: 'AWS Stations', desc: 'Interactive map & network monitoring', icon: CloudSun },
    { to: '/monitoring', label: 'Live Monitoring', desc: 'Real-time telemetry & Open-Meteo benchmark', icon: LineChart },
    { to: '/anomalies', label: 'Anomaly Explorer', desc: 'AI Isolation Forest & LSTM Autoencoder analysis', icon: Search },
    { to: '/alerts', label: 'Live Alerts', desc: 'Active hazard notifications & threshold warnings', icon: Bell },
    { to: '/analytics', label: 'Analytics & Insights', desc: 'Spatial consensus & sensor drift diagnostics', icon: BrainCircuit },
    { to: '/rankings', label: 'Reliability Rankings', desc: 'Station Trust Score leaderboard', icon: Trophy },
    { to: '/prediction', label: 'Weather Outlook', desc: 'Forecast validation & prediction model', icon: Sparkles },
    { to: '/history', label: 'Historical Analysis', desc: 'Supabase historical telemetry archives', icon: Calendar },
    { to: '/maintenance', label: 'Maintenance Queue', desc: 'Sensor repair & calibration workflows', icon: Wrench }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-poppins bg-black text-white selection:bg-white selection:text-black">
      {/* BACKGROUND VIDEO */}
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
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90 z-[1] pointer-events-none" />

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 min-h-screen w-full flex flex-col p-4 sm:p-6 lg:p-10 max-w-[1700px] mx-auto justify-between gap-8">

        {/* MAIN SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 items-stretch">
          
          {/* ======================================================== */}
          {/* LEFT PANEL (~52% width on desktop) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-12 rounded-3xl liquid-glass-strong min-h-[640px] shadow-2xl">
            
            {/* TOP NAVIGATION HEADER */}
            <div className="flex items-center justify-between gap-4 w-full border-b border-white/10 pb-6">
              {/* BRANDING */}
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-2xl liquid-glass flex items-center justify-center text-white">
                  <Shield className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-medium tracking-tight text-white flex items-center gap-2">
                    SKYGUARD <span className="font-light text-white/70">AI</span>
                  </h1>
                  <p className="text-[10px] tracking-[0.25em] text-white/50 font-medium uppercase">
                    TRUST LAYER FOR AUTOMATIC WEATHER STATIONS
                  </p>
                </div>
              </div>

              {/* MENU PILL BUTTON */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="liquid-glass rounded-full px-5 py-2.5 text-xs font-medium tracking-widest uppercase flex items-center gap-2 text-white hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer"
                aria-label="Open navigation menu"
              >
                <span>MENU</span>
                <Menu className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {/* HERO CONTENT */}
            <div className="my-10 lg:my-14 space-y-8 max-w-2xl">
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-medium leading-[1.08] tracking-tight text-white">
                Trusting the Data <br />
                <span className="font-serif-italic font-normal text-white/80">Behind Every</span> <br />
                Weather Station
              </h2>

              <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed max-w-xl">
                Intelligence behind every weather reading. SkyGuard validates telemetry in real time, detecting anomalies and scoring station reliability before critical decisions are made.
              </p>

              {/* PRIMARY CTA & FEATURE PILLS */}
              <div className="pt-2 space-y-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="liquid-glass-strong group rounded-full px-8 py-4 text-sm font-medium tracking-wider uppercase flex items-center gap-3 text-white hover:bg-white/15 hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 shadow-2xl cursor-pointer border border-white/20"
                >
                  <span>Enter Command Center</span>
                  <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1.5" />
                </button>

                {/* THREE GLASS PILLS */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <div className="liquid-glass rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    AI Anomaly Detection
                  </div>
                  <div className="liquid-glass rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    Station Trust
                  </div>
                  <div className="liquid-glass rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    Real-Time Telemetry
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM QUOTE SECTION */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white/50">
              <div className="space-y-1">
                <div className="text-[10px] tracking-[0.3em] font-medium text-white/40 uppercase">
                  TRUST THE DATA
                </div>
                <p className="text-xs sm:text-sm font-light text-white/70">
                  "Every weather reading tells a story. <span className="font-serif-italic text-white">SkyGuard helps you know when to trust it.</span>"
                </p>
              </div>

              <div className="text-right text-[10px] tracking-widest text-white/40 uppercase font-mono hidden sm:block">
                VERIFIED ARCHITECTURE
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL (~48% width on desktop) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* TOP BAR / UTILITY CONTROLS */}
            <div className="flex items-center justify-between gap-3 w-full flex-wrap">
              <div className="liquid-glass rounded-full px-4 py-2 text-xs font-mono tracking-wider flex items-center gap-2.5 text-white/90">
                <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-white animate-pulse' : 'text-white/40'}`} />
                <span>SYSTEM STATUS</span>
                <span className="text-white/40">•</span>
                <span className="font-semibold text-white">{isConnected ? 'OPERATIONAL' : 'ACTIVE'}</span>
              </div>

              <div className="liquid-glass rounded-full px-4 py-2 text-xs font-mono tracking-wider flex items-center gap-2 text-white/70">
                <Activity className="w-3.5 h-3.5 text-white/60 animate-pulse" />
                <span>TELEMETRY STREAM</span>
              </div>
            </div>

            {/* INTELLIGENCE CARD */}
            <div className="liquid-glass-strong p-6 sm:p-8 rounded-3xl space-y-4 hover:border-white/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.25em] text-white/50 font-medium uppercase font-mono">
                  INTELLIGENCE LAYER
                </span>
                <Layers className="w-4 h-4 text-white/60" />
              </div>

              <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
                Enter the Intelligence Layer
              </h3>

              <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                Monitor, detect, explain and validate Automatic Weather Station data with continuous spatial consensus scoring.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="liquid-glass rounded-full px-5 py-2.5 text-xs font-medium tracking-wider uppercase flex items-center gap-2 text-white hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Open Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

            {/* TWO FEATURE CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* CARD 1: AI ANOMALY ENGINE */}
              <div 
                onClick={() => navigate('/anomalies')}
                className="liquid-glass p-5 rounded-2xl space-y-3 cursor-pointer hover:bg-white/[0.03] transition-all group"
              >
                <div className="p-2 rounded-xl liquid-glass w-fit text-white">
                  <Sparkles className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-medium tracking-widest text-white uppercase flex items-center justify-between">
                    <span>AI ANOMALY ENGINE</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-white/60 font-light mt-1.5 leading-relaxed">
                    Detect abnormal station readings using intelligent data analysis.
                  </p>
                </div>
              </div>

              {/* CARD 2: TRUST SCORE */}
              <div 
                onClick={() => navigate('/rankings')}
                className="liquid-glass p-5 rounded-2xl space-y-3 cursor-pointer hover:bg-white/[0.03] transition-all group"
              >
                <div className="p-2 rounded-xl liquid-glass w-fit text-white">
                  <Shield className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-medium tracking-widest text-white uppercase flex items-center justify-between">
                    <span>TRUST SCORE</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-white/60 font-light mt-1.5 leading-relaxed">
                    Measure confidence in station data using multiple validation signals.
                  </p>
                </div>
              </div>

            </div>

            {/* BOTTOM WIDE FEATURE CARD */}
            <div 
              onClick={() => navigate('/monitoring')}
              className="liquid-glass-strong p-6 rounded-3xl flex items-center justify-between gap-4 cursor-pointer hover:border-white/30 transition-all group"
            >
              <div className="space-y-1.5 max-w-md">
                <span className="text-[10px] tracking-[0.2em] text-white/50 font-medium uppercase font-mono">
                  BENCHMARK COMPARISON
                </span>
                <h4 className="text-base sm:text-lg font-medium text-white tracking-tight">
                  Real-Time Weather Intelligence
                </h4>
                <p className="text-xs text-white/60 font-light leading-relaxed">
                  Compare station telemetry with reference weather data, monitor sensor health and investigate anomalies.
                </p>
              </div>

              <div className="p-3 rounded-full liquid-glass text-white group-hover:scale-110 transition-transform flex-shrink-0">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE NAVIGATION MENU MODAL */}
      {/* ======================================================== */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-in fade-in duration-200">
          {/* BACKDROP */}
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          />

          {/* MODAL CONTAINER */}
          <div className="relative z-10 w-full max-w-4xl liquid-glass-strong p-6 sm:p-8 lg:p-10 rounded-3xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-white/20">
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl liquid-glass text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white tracking-tight">
                    COMMAND CENTER MODULES
                  </h3>
                  <p className="text-[10px] tracking-widest text-white/50 uppercase">
                    SKYGUARD AI INTELLIGENCE NAVIGATION
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2.5 rounded-full liquid-glass text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close menu modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODULE LINKS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {navigationModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.to}
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(mod.to);
                    }}
                    className="liquid-glass p-4 rounded-2xl flex items-start gap-3.5 cursor-pointer hover:bg-white/[0.06] hover:scale-[1.01] transition-all group"
                  >
                    <div className="p-2.5 rounded-xl liquid-glass text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-white tracking-wide flex items-center justify-between">
                        <span>{mod.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <p className="text-[11px] text-white/60 font-light mt-1 truncate">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER ACTION */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
              <span>SKYGUARD AI v1.0.0</span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>ENTER DASHBOARD DIRECTLY</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
