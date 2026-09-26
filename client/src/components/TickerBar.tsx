import React from 'react';
import { Bell, ShieldCheck, AlertCircle, Info } from 'lucide-react';

export const TickerBar: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-3 border-b border-slate-700 flex items-center overflow-hidden font-sans select-none">
      <div className="bg-red-700 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-3 shadow-sm">
        <Bell className="w-3 h-3 animate-pulse" />
        <span>IMPORTANT INFORMATION</span>
      </div>
      <div className="overflow-hidden relative w-full">
        <div className="whitespace-nowrap inline-block animate-marquee font-medium text-slate-200">
          <span className="mx-4 text-amber-300">
            • AWS Network Status: 982/1008 Stations Active (97.4% Operational Rate)
          </span>
          <span className="mx-4 text-emerald-300">
            • ML Quality Control Engine: IsoForest & LSTM Spatial Consensus Online
          </span>
          <span className="mx-4 text-blue-300">
            • System Update: Real-time Telemetry Stream Synced with India Meteorological Department Standards
          </span>
          <span className="mx-4 text-amber-300">
            • Critical Alerts: 3 Stations Pending Maintenance Verification
          </span>
        </div>
      </div>
    </div>
  );
};
