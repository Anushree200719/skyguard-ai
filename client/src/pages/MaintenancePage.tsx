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
    alert(`Generated Official Government Calibration & Maintenance Audit Report for Station ${stId}!`);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>FIELD SERVICE OPERATIONS</span>
            <span>•</span>
            <span>CALIBRATION QUEUE</span>
          </div>
          <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <Wrench className="w-5 h-5 text-blue-900 flex-shrink-0" />
            PRIORITY FIELD MAINTENANCE & CALIBRATION QUEUE ({data.totalMaintenanceRequired})
          </h1>
          <p className="text-xs text-slate-600">AWS stations automatically ranked for technician dispatch based on hardware degradation & RUL</p>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-3 font-mono">
        {data.queue.length === 0 ? (
          <div className="gov-card p-10 text-center text-slate-500 text-xs">
            No maintenance dispatches required. All AWS sensor health scores are within nominal parameters (&gt;90%).
          </div>
        ) : (
          data.queue.map((item) => {
            const sh = item.sensorHealth || { temperature: 32, humidity: 94, pressure: 88, wind: 92, rainfall: 96 };
            const isMarked = markedStations[item.stationId];

            return (
              <div
                key={item.stationId}
                className="gov-card p-4 flex flex-col gap-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        item.priority === 'PRIORITY 1' ? 'gov-badge-red' :
                        (item.priority === 'PRIORITY 2' ? 'gov-badge-amber' : 'gov-badge-blue')
                      }`}>
                        {item.priority}
                      </span>
                      <span className="font-bold text-sm text-blue-900">{item.stationId}</span>
                      <span className="font-bold text-slate-900 text-xs">{item.stationName}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-800">Issue: {item.issue}</p>
                    <p className="text-xs text-blue-950">Recommended Action: {item.recommendedAction}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                      <span className="text-[9px] text-slate-500 block uppercase">HEALTH SCORE</span>
                      <span className="font-bold text-blue-950 text-base">{item.healthScore}/100</span>
                    </div>

                    <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                      <span className="text-[9px] text-slate-500 block uppercase">EST. RUL</span>
                      <span className="font-bold text-blue-950 text-base">{item.rulDays || 45} DAYS</span>
                    </div>
                  </div>
                </div>

                {/* Per-Sensor Breakdown */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    PER-SENSOR PARAMETER HEALTH BREAKDOWN:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[9px] text-slate-500 block">TEMP</span>
                      <span className="font-bold text-slate-900">{sh.temperature}/100</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[9px] text-slate-500 block">HUMIDITY</span>
                      <span className="font-bold text-slate-900">{sh.humidity}/100</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[9px] text-slate-500 block">PRESSURE</span>
                      <span className="font-bold text-slate-900">{sh.pressure}/100</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[9px] text-slate-500 block">WIND</span>
                      <span className="font-bold text-slate-900">{sh.wind}/100</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded col-span-2 sm:col-span-1">
                      <span className="text-[9px] text-slate-500 block">RAINFALL</span>
                      <span className="font-bold text-slate-900">{sh.rainfall}/100</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => toggleMarkInspection(item.stationId)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                      isMarked
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {isMarked ? 'MARKED FOR DISPATCH' : 'MARK FOR DISPATCH'}
                  </button>

                  <button
                    onClick={() => handleGenerateReport(item.stationId)}
                    className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold uppercase transition-colors"
                  >
                    GENERATE CALIBRATION REPORT
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
