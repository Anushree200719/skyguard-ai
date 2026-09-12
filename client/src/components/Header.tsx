import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Menu, X, LayoutDashboard, CloudSun, LineChart, Search, Bell, Wrench, BrainCircuit } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { socket } from '../services/socket';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

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

  return (
    <header className="h-16 px-2.5 sm:px-4 md:px-6 glass-card flex items-center justify-between border-b border-sky-500/20 sticky top-0 z-40 bg-[#070a12]/95 backdrop-blur-md min-w-0">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-sky-400 md:hidden hover:bg-slate-800 focus:outline-none touch-manipulation cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="p-1.5 sm:p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg shadow-lg shadow-sky-500/10 flex-shrink-0">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 animate-pulse" />
        </div>
        <div className="min-w-0 truncate">
          <h1 className="font-orbitron font-bold text-sm sm:text-base md:text-lg tracking-wider text-slate-100 flex items-center gap-1.5 truncate">
            SKYGUARD <span className="text-sky-400">AI</span>
          </h1>
          <p className="hidden md:block text-[9px] lg:text-[10px] text-slate-400 tracking-widest font-semibold uppercase truncate">
            AUTOMATIC WEATHER STATION TRUST LAYER & INTELLIGENCE COMMAND
          </p>
        </div>
      </div>

      {/* Desktop Status Bar */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/80 border border-slate-700/60 rounded-md">
          <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span className="text-[11px] lg:text-xs font-mono font-medium text-slate-300">AUTO-INGESTION: ACTIVE</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/80 border border-slate-700/60 rounded-md">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="text-[11px] lg:text-xs font-mono font-medium text-slate-300">
            {isConnected ? 'LIVE TELEMETRY STREAM' : 'RECONNECTING'}
          </span>
        </div>

        <div className="font-mono text-[11px] lg:text-xs text-sky-400 font-semibold px-2.5 py-1.5 bg-sky-950/40 border border-sky-500/20 rounded-md">
          {timeStr || '00:00:00 UTC'}
        </div>
      </div>

      {/* Mobile Right Quick Status */}
      <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/90 border border-slate-800 rounded text-[10px] font-mono text-sky-400">
          <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="font-bold">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
};
