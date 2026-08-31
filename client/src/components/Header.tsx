import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity } from 'lucide-react';
import { socket } from '../services/socket';

export const Header: React.FC = () => {
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
    <header className="h-16 px-6 glass-card flex items-center justify-between border-b border-sky-500/20 sticky top-0 z-40 bg-[#070a12]/90 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg shadow-lg shadow-sky-500/10">
          <Shield className="w-6 h-6 text-sky-400 animate-pulse" />
        </div>
        <div>
          <h1 className="font-orbitron font-bold text-lg tracking-wider text-slate-100 flex items-center gap-2">
            SKYGUARD <span className="text-sky-400">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 tracking-widest font-semibold uppercase">
            AUTOMATIC WEATHER STATION TRUST LAYER & INTELLIGENCE COMMAND
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
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
    </header>
  );
};
