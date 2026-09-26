import React, { useState, useEffect } from 'react';
import { Activity, Menu, X, Globe } from 'lucide-react';
import { socket } from '../services/socket';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu, onOpenLogin }) => {
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
    <header className="sticky top-0 z-40 w-full flex flex-col shadow-md font-sans">
      {/* 1. TOP UTILITY STRIP */}
      <div className="gov-header-bar px-3 sm:px-6 py-1 text-[11px] font-medium flex flex-wrap items-center justify-between border-b border-slate-700 select-none">
        <div className="flex items-center gap-2 sm:gap-3 text-slate-200">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <span className="text-xs">🇮🇳</span>
            <span>{lang === 'HI' ? 'भारत सरकार' : 'भारत सरकार | Government of India'}</span>
          </div>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">
            {lang === 'HI' ? 'पृथ्वी विज्ञान मंत्रालय' : 'Ministry of Earth Sciences'}
          </span>
          <span className="hidden lg:inline text-slate-500">|</span>
          <span className="hidden lg:inline text-slate-300">
            {lang === 'HI' ? 'भारत मौसम विज्ञान विभाग' : 'India Meteorological Department'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          {/* Real-time Dual Clock */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-amber-400 font-bold">{istTimeStr || '12:42:00 IST'}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">{timeStr || '07:12:00 UTC'}</span>
          </div>

          {/* Accessibility Font Size Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-[10px]">
            <span className="text-slate-400 mr-1">Text:</span>
            <button onClick={() => setFontSize('sm')} className={`px-1 rounded ${fontSize === 'sm' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>A-</button>
            <button onClick={() => setFontSize('base')} className={`px-1 rounded ${fontSize === 'base' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>A</button>
            <button onClick={() => setFontSize('lg')} className={`px-1 rounded ${fontSize === 'lg' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>A+</button>
          </div>

          {/* Language Toggle */}
          <button 
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')} 
            className="flex items-center gap-1 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-200 hover:text-white transition-colors"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{lang === 'EN' ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>

      {/* 2. GOVERNMENT IDENTITY AREA */}
      <div className="bg-white text-slate-900 border-b border-slate-200 px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Identity & Neutral Emblem Placeholder */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded border border-slate-300 text-slate-700 md:hidden hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            {/* Government-style neutral emblem placeholder */}
            <div className="w-11 h-11 rounded border-2 border-blue-900 bg-slate-50 flex flex-col items-center justify-center text-blue-900 shadow-sm flex-shrink-0">
              <span className="text-base font-serif font-bold leading-none">🇮🇳</span>
              <span className="text-[7px] font-bold tracking-tighter uppercase mt-0.5 text-blue-950">GOV SEC</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  GOVERNMENT OF INDIA • AWS TECHNICAL MONITORING DIVISION
                </span>
              </div>
              <h1 className="font-bold text-lg sm:text-xl text-blue-950 tracking-tight font-sans leading-snug">
                SKYGUARD AI
              </h1>
              <p className="text-[11px] text-slate-600 font-medium">
                Trust Layer for Automatic Weather Stations | AI-assisted AWS Data Quality Monitoring System
              </p>
            </div>
          </div>
        </div>

        {/* Right Academic / Demo Badge & Live Connection Badges */}
        <div className="flex items-center gap-3">
          {/* ACADEMIC / DEMONSTRATION PROJECT BADGE */}
          <div className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded font-semibold text-xs flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">PROJECT STATUS</span>
            <span className="text-amber-950 font-bold">ACADEMIC / DEMONSTRATION PROJECT</span>
          </div>

          <div className="hidden lg:flex flex-col gap-1 text-right text-xs">
            <div className="flex items-center justify-end gap-1.5 text-emerald-700 font-semibold text-[11px]">
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              <span>WMO QC ENGINE: ACTIVE</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {isConnected ? 'LIVE TELEMETRY: CONNECTED' : 'STREAM: RECONNECTING'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. INDIAN TRICOLOUR VISUAL ACCENT STRIP */}
      <div className="w-full flex h-1.5 select-none">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-[#FFFFFF]"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>
    </header>
  );
};


