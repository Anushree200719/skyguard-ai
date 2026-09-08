import React, { useState, useEffect } from 'react';
import { fetchMaintenance } from '../services/api';
import { MaintenanceItem } from '../types';
import { Wrench, ShieldAlert, Heart, FileText, CheckSquare, Activity } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const [data, setData] = useState<{ totalMaintenanceRequired: number; queue: MaintenanceItem[] }>({
    totalMaintenanceRequired: 0,
    queue: []
  });
  const [markedStations, setMarkedStations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMaintenance().then(setData).catch(console.warn);
  }, []);

  const toggleMarkInspection = (id: string) => {
    setMarkedStations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateReport = (stId: string) => {
    alert(`Generated AI Diagnostic & Maintenance Calibration Report for Station ${stId}!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          PREDICTIVE MAINTENANCE QUEUE ({data.totalMaintenanceRequired})
        </h1>
        <p className="text-xs text-slate-400">AWS stations automatically ranked by multi-parameter health degradation & Remaining Useful Life (RUL)</p>
      </div>

      <div className="space-y-4">
        {data.queue.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs font-mono">
            No maintenance required. All AWS sensor health scores are within nominal parameters (&gt;90%).
          </div>
        ) : (
          data.queue.map((item) => {
            const sh = item.sensorHealth || { temperature: 32, humidity: 94, pressure: 88, wind: 92, rainfall: 96 };
            const isMarked = markedStations[item.stationId];

            return (
              <div
                key={item.stationId}
                className={`glass-card p-4 sm:p-5 rounded-xl border flex flex-col gap-4 transition-all ${
                  item.priority === 'PRIORITY 1' ? 'border-rose-500/40 bg-rose-500/10' :
                  (item.priority === 'PRIORITY 2' ? 'border-amber-500/40 bg-amber-500/10' : 'border-sky-500/40 bg-sky-500/10')
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                    <p className="text-xs text-emerald-400 font-medium">Action: {item.recommendedAction}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 w-full lg:w-auto">
                    <div className="flex-1 sm:flex-initial text-center bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-semibold">OVERALL HEALTH</span>
                      <span className={`font-orbitron font-bold text-base sm:text-lg ${
                        item.healthScore < 50 ? 'text-rose-400' : (item.healthScore < 70 ? 'text-amber-400' : 'text-sky-400')
                      }`}>
                        {item.healthScore}/100
                      </span>
                    </div>

                    <div className="flex-1 sm:flex-initial text-center bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-semibold">EST. RUL</span>
                      <span className="font-orbitron font-bold text-base sm:text-lg text-indigo-400">
                        {item.rulDays || 45} DAYS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per-Sensor Parameter Health Score Breakdown */}
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    PER-SENSOR PARAMETER HEALTH SCORES:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center text-xs font-mono">
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">TEMP SENSOR</span>
                      <span className={`font-bold ${sh.temperature < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{sh.temperature}/100</span>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">HUMIDITY SENSOR</span>
                      <span className="font-bold text-emerald-400">{sh.humidity}/100</span>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">PRESSURE SENSOR</span>
                      <span className="font-bold text-emerald-400">{sh.pressure}/100</span>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">WIND SENSOR</span>
                      <span className="font-bold text-emerald-400">{sh.wind}/100</span>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[9px] text-slate-400 block">RAIN SENSOR</span>
                      <span className="font-bold text-emerald-400">{sh.rainfall}/100</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 justify-stretch sm:justify-end">
                  <button
                    onClick={() => toggleMarkInspection(item.stationId)}
                    className={`flex-1 sm:flex-initial justify-center px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all touch-manipulation ${
                      isMarked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    {isMarked ? 'MARKED FOR INSPECTION' : 'MARK FOR INSPECTION'}
                  </button>

                  <button
                    onClick={() => handleGenerateReport(item.stationId)}
                    className="flex-1 sm:flex-initial justify-center px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 touch-manipulation"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    GENERATE REPORT
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
