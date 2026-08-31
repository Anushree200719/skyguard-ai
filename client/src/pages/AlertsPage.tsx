import React, { useState, useEffect } from 'react';
import { fetchAlerts, acknowledgeAlert } from '../services/api';
import { Alert } from '../types';
import { BellRing, CheckCircle2 } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadAlerts = () => {
    fetchAlerts().then(setAlerts).catch(console.warn);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAck = async (id: string) => {
    await acknowledgeAlert(id);
    loadAlerts();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
          <BellRing className="w-5 h-5 text-rose-400" />
          SYSTEM ALERTS & NOTIFICATIONS ({alerts.length})
        </h1>
        <p className="text-xs text-slate-400">Real-time alert notifications dispatched by the trust layer</p>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs font-mono">
            No active system alerts. All stations operating nominally.
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt._id}
              className={`glass-card p-4 rounded-xl border flex items-center justify-between transition-all ${
                alt.level === 'WEATHER_EVENT' ? 'border-sky-500/40 bg-sky-500/10' :
                (alt.level === 'CRITICAL' ? 'border-rose-500/40 bg-rose-500/10' : 'border-amber-500/40 bg-amber-500/10')
              }`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-orbitron font-bold text-xs text-slate-100">{alt.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/60 uppercase text-slate-300">
                    {alt.level}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{alt.message}</p>
                <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                  Station: {alt.stationId} • {new Date(alt.timestamp).toLocaleString()}
                </span>
              </div>

              {!alt.acknowledged ? (
                <button
                  onClick={() => handleAck(alt._id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold"
                >
                  ACKNOWLEDGE
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> ACKNOWLEDGED
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
