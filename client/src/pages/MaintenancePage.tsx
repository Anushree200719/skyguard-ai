import React, { useState, useEffect } from 'react';
import { fetchMaintenance } from '../services/api';
import { MaintenanceItem } from '../types';
import { Wrench, ShieldAlert, Heart } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const [data, setData] = useState<{ totalMaintenanceRequired: number; queue: MaintenanceItem[] }>({
    totalMaintenanceRequired: 0,
    queue: []
  });

  useEffect(() => {
    fetchMaintenance().then(setData).catch(console.warn);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          PREDICTIVE MAINTENANCE PRIORITY QUEUE ({data.totalMaintenanceRequired})
        </h1>
        <p className="text-xs text-slate-400">AWS stations sorted automatically by health decay rate and defect severity</p>
      </div>

      <div className="space-y-4">
        {data.queue.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs font-mono">
            No maintenance required. All AWS sensor health scores are within nominal parameters (&gt;90%).
          </div>
        ) : (
          data.queue.map((item) => (
            <div
              key={item.stationId}
              className={`glass-card p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                item.priority === 'PRIORITY 1' ? 'border-rose-500/40 bg-rose-500/10' :
                (item.priority === 'PRIORITY 2' ? 'border-amber-500/40 bg-amber-500/10' : 'border-sky-500/40 bg-sky-500/10')
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={`font-orbitron font-bold text-xs px-2.5 py-1 rounded ${
                    item.priority === 'PRIORITY 1' ? 'bg-rose-600 text-white' :
                    (item.priority === 'PRIORITY 2' ? 'bg-amber-600 text-white' : 'bg-sky-600 text-white')
                  }`}>
                    {item.priority}
                  </span>
                  <span className="font-orbitron font-bold text-sm text-sky-400">{item.stationId}</span>
                  <span className="text-xs font-bold text-slate-200">{item.stationName}</span>
                </div>

                <p className="text-xs font-semibold text-slate-300">Issue: {item.issue}</p>
                <p className="text-xs text-emerald-400 font-medium">Recommended Action: {item.recommendedAction}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">HEALTH SCORE</span>
                  <span className={`font-orbitron font-bold text-lg ${
                    item.healthScore < 50 ? 'text-rose-400' : (item.healthScore < 70 ? 'text-amber-400' : 'text-sky-400')
                  }`}>
                    {item.healthScore}%
                  </span>
                </div>

                <button className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-orbitron font-bold">
                  SCHEDULE SERVICE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
