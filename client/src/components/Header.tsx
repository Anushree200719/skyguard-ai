import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Menu, X, Globe, Eye, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { socket } from '../services/socket';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [istTimeStr, setIstTimeStr] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toUTCString().slice(17, 25) + ' UTC');
      setIstTimeStr(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
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
    <header className="sticky top-0 z-40 w-full flex flex-col shadow-md">
      {/* 1. TOP OFFICIAL GOVERNMENT STRIP */}
      <div className="gov-header-bar px-3 sm:px-6 py-1.5 text-[11px] font-medium flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2 sm:gap-3 text-slate-200">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            {/* National Emblem Silhouette Placeholder */}
            <div className="w-4 h-4 rounded-full border border-amber-400 flex items-center justify-center text-[9px] font-serif font-bold">
              🇮🇳
            </div>
            <span>GOVERNMENT OF INDIA</span>
          </div>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">MINISTRY OF EARTH SCIENCES</span>
          <span className="hidden lg:inline text-slate-500">|</span>
          <span className="hidden lg:inline text-slate-300">INDIA METEOROLOGICAL DEPARTMENT</span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          {/* Clock */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-amber-400 font-bold">{istTimeStr || '00:00:00 IST'}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">{timeStr || '00:00:00 UTC'}</span>
          </div>

          {/* Accessibility Font Size Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            <button onClick={() => setFontSize('sm')} className={`px-1 rounded text-[10px] ${fontSize === 'sm' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>A-</button>
            <button onClick={() => setFontSize('base')} className={`px-1 rounded text-[10px] ${fontSize === 'base' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>A</button>
            <button onClick={() => setFontSize('lg')} className={`px-1 rounded text-[10px] ${fontSize === 'lg' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>A+</button>
          </div>

          {/* Language Selector */}
          <button 
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')} 
            className="flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-200 hover:text-white"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{lang === 'EN' ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN BRAND & NAVIGATION BANNER */}
      <div className="bg-white text-slate-900 border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded border border-slate-300 text-slate-700 md:hidden hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded bg-blue-900 border-2 border-amber-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-blue-950 font-sans leading-none">
                  SKYGUARD AI
                </h1>
                <span className="gov-badge-blue text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Govt Portal
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium tracking-normal mt-0.5">
                National Automatic Weather Station (AWS) Data Quality & Trust Infrastructure
              </p>
            </div>
          </Link>
        </div>

        {/* Operational Status Badges */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-medium">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>ML QC ENGINE: ACTIVE</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${
            isConnected ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-blue-600 animate-pulse' : 'text-amber-600'}`} />
            <span>{isConnected ? 'TELEMETRY STREAM: CONNECTED' : 'STREAM: RECONNECTING'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
