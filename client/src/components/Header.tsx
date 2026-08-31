import React, { useState, useEffect } from 'react';
import { Shield, Bell, Zap, Radio, RefreshCw } from 'lucide-react';
import { socket } from '../services/socket';

interface HeaderProps {
  onOpenFaultInjector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFaultInjector }) => {
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
    <header className="h-16 px-6 glass-card flex items-center justify-between border-b border-sky-500/20 sticky top-0 z-40 bg-[#070a12]/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg shadow-lg shadow-sky-500/10">
          <Shield className="w-6 h-6 text-sky-400 animate-pulse" />
        </div>
        <div>
          <h1 className="font-orbitron font-bold text-lg tracking-wider text-slate-100 flex items-center gap-2">
            SKYGUARD <span className="text-sky-400">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 tracking-widest font-semibold uppercase">
            TRUST LAYER FOR AUTOMATIC WEATHER STATIONS
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenFaultInjector}
          className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-md font-medium text-xs transition-all shadow-md hover:shadow-rose-500/20"
        >
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          FAULT INJECTOR
        </button>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-700/50 rounded-md">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="text-xs font-mono font-medium text-slate-300">
            {isConnected ? 'LIVE SOCKET ACTIVE' : 'RECONNECTING'}
          </span>
        </div>

        <div className="font-mono text-xs text-sky-400 font-semibold px-3 py-1 bg-sky-950/40 border border-sky-500/20 rounded-md">
          {timeStr || '00:00:00 UTC'}
        </div>
      </div>
    </header>
  );
};
