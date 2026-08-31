import React, { useState, useEffect } from 'react';
import { fetchAlerts, acknowledgeAlert } from '../services/api';
import { Alert } from '../types';
import { Bell, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

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

  const filtered = alerts.filter(a => !categoryFilter || a.category === categoryFilter || a.level === categoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400" />
            LIVE ALERT COMMAND & NOTIFICATIONS ({filtered.length})
          </h1>
          <p className="text-xs text-slate-400">Categorized system alerts dispatched by the AI decision engine</p>
        </div>

        <div className="flex gap-2">
          {['', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                categoryFilter === cat
                  ? 'bg-sky-500 text-slate-900 border-sky-400'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {cat === '' ? 'ALL ALERTS' : (cat === 'CRITICAL' ? '🔴 CRITICAL' : (cat === 'HIGH' ? '🟠 HIGH' : (cat === 'WARNING' ? '🟡 WARNING' : '🟢 INFO')))}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs font-mono">
            No alerts matching selected category. System operating nominally.
          </div>
        ) : (
          filtered.map((alt) => (
            <div
              key={alt._id}
              className={`glass-card p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                alt.level === 'CRITICAL' || alt.category === 'CRITICAL' ? 'border-rose-500/40 bg-rose-500/10' :
                (alt.level === 'HIGH' || alt.category === 'HIGH' ? 'border-amber-500/40 bg-amber-500/10' :
                (alt.level === 'WEATHER_EVENT' ? 'border-sky-500/40 bg-sky-500/10' : 'border-emerald-500/40 bg-emerald-500/10'))
              }`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-orbitron font-bold text-xs text-slate-100">{alt.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                    alt.level === 'CRITICAL' ? 'bg-rose-600 text-white' :
                    (alt.level === 'HIGH' ? 'bg-amber-600 text-white' :
                    (alt.level === 'WEATHER_EVENT' ? 'bg-sky-600 text-white' : 'bg-emerald-600 text-white'))
                  }`}>
                    {alt.level === 'CRITICAL' ? '🔴 CRITICAL' : (alt.level === 'HIGH' ? '🟠 HIGH' : (alt.level === 'WARNING' ? '🟡 WARNING' : '🟢 INFO'))}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{alt.message}</p>
                {alt.aiExplanation && (
                  <p className="text-[11px] text-sky-300/80 mt-1 font-mono">AI Rationale: {alt.aiExplanation}</p>
                )}
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
