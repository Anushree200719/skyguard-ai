import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Menu, X, LayoutDashboard, CloudSun, LineChart, Search, Bell, Wrench, BrainCircuit } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
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
    <header className="h-16 px-3 sm:px-5 md:px-6 liquid-glass flex items-center justify-between sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 min-w-0 shadow-lg">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full liquid-glass text-white md:hidden hover:bg-white/10 focus:outline-none touch-manipulation cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/dashboard" className="flex items-center gap-3 min-w-0 group cursor-pointer">
          <div className="p-2 rounded-xl liquid-glass text-white flex-shrink-0 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 truncate">
            <h1 className="font-poppins font-medium text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 truncate">
              SKYGUARD <span className="font-light text-white/70">AI</span>
            </h1>
            <p className="hidden md:block text-[9px] lg:text-[10px] text-white/50 tracking-[0.2em] font-medium uppercase truncate">
              TRUST LAYER <span className="font-serif-italic font-normal text-white/70">for</span> AUTOMATIC WEATHER STATIONS
            </p>
          </div>
        </Link>
      </div>

      {/* Desktop Status Bar */}
      <div className="hidden md:flex items-center gap-2.5 lg:gap-3 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 liquid-glass rounded-full text-white/80">
          <Activity className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider font-medium">AUTO-INGESTION: ACTIVE</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 liquid-glass rounded-full text-white/90">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-white animate-pulse' : 'text-white/40'}`} />
          <span className="text-[11px] font-mono tracking-wider font-medium">
            {isConnected ? 'LIVE TELEMETRY STREAM' : 'RECONNECTING'}
          </span>
        </div>

        <div className="font-mono text-[11px] text-white font-medium px-3 py-1.5 liquid-glass rounded-full">
          {timeStr || '00:00:00 UTC'}
        </div>
      </div>

      {/* Mobile Right Quick Status */}
      <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 liquid-glass rounded-full text-[10px] font-mono text-white">
          <Radio className={`w-3 h-3 ${isConnected ? 'text-white animate-pulse' : 'text-white/40'}`} />
          <span className="font-bold">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
};
