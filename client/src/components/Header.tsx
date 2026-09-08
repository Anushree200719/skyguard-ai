import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Menu, X, LayoutDashboard, CloudSun, LineChart, Search, Bell, Wrench, BrainCircuit } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { socket } from '../services/socket';

export const Header: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toUTCString().slice(17, 25) + ' UTC');
    }, 1000);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      clearInterval(timer);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/stations', label: 'AWS Stations', icon: CloudSun },
    { to: '/monitoring', label: 'Live Monitoring', icon: LineChart },
    { to: '/anomalies', label: 'Anomaly Explorer', icon: Search },
    { to: '/alerts', label: 'Live Alerts', icon: Bell },
    { to: '/maintenance', label: 'Maintenance Queue', icon: Wrench },
    { to: '/analytics', label: 'Analytics & Insights', icon: BrainCircuit }
  ];

  return (
    <header className="h-16 px-4 sm:px-6 glass-card flex items-center justify-between border-b border-sky-500/20 sticky top-0 z-40 bg-[#070a12]/95 backdrop-blur-md">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-sky-400 md:hidden hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="p-1.5 sm:p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg shadow-lg shadow-sky-500/10">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 animate-pulse" />
        </div>
        <div>
          <h1 className="font-orbitron font-bold text-base sm:text-lg tracking-wider text-slate-100 flex items-center gap-2">
            SKYGUARD <span className="text-sky-400">AI</span>
          </h1>
          <p className="hidden sm:block text-[9px] sm:text-[10px] text-slate-400 tracking-widest font-semibold uppercase">
            AUTOMATIC WEATHER STATION TRUST LAYER & INTELLIGENCE COMMAND
          </p>
        </div>
      </div>

      {/* Desktop Status Bar */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/60 rounded-md">
          <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-300">AUTO-INGESTION: ACTIVE</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/60 rounded-md">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="text-xs font-mono font-medium text-slate-300">
            {isConnected ? 'LIVE TELEMETRY STREAM' : 'RECONNECTING'}
          </span>
        </div>

        <div className="font-mono text-xs text-sky-400 font-semibold px-3 py-1.5 bg-sky-950/40 border border-sky-500/20 rounded-md">
          {timeStr || '00:00:00 UTC'}
        </div>
      </div>

      {/* Mobile Right Quick Status */}
      <div className="flex md:hidden items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/90 border border-slate-800 rounded text-[10px] font-mono text-sky-400">
          <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-slate-950/98 border-b border-sky-500/30 p-4 shadow-2xl md:hidden z-50 flex flex-col gap-3 backdrop-blur-2xl">
          <div className="text-[10px] font-orbitron text-sky-400 font-bold px-2 tracking-widest uppercase">
            COMMAND CENTER NAVIGATION
          </div>
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
