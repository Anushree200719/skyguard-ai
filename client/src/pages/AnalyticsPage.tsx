import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../services/api';
import { StatCard } from '../components/StatCard';
import { BrainCircuit, ShieldCheck, AlertTriangle, CloudLightning, Activity, BarChart2, Sliders, Cpu } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { WhatIfSimulatorModal } from '../components/WhatIfSimulatorModal';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchAnalytics().then(res => setData(res.summary)).catch(console.warn);
  }, []);

  const anomalyTypeData = [
    { name: 'Genuine Weather Events', count: data?.genuineWeatherEvents || 4, color: '#38bdf8' },
    { name: 'Sensor Spikes', count: 3, color: '#f59e0b' },
    { name: 'Sensor Drift', count: 2, color: '#ef4444' },
    { name: 'Frozen Sensor', count: 1, color: '#818cf8' },
    { name: 'Missing Data', count: data?.communicationFailures || 1, color: '#ec4899' }
  ];

  const stationPerformanceData = [
    { station: 'AWS-101', health: 98, anomalies: 1 },
    { station: 'AWS-102', health: 95, anomalies: 2 },
    { station: 'AWS-103', health: 94, anomalies: 1 },
    { station: 'AWS-104', health: 92, anomalies: 0 },
    { station: 'AWS-201', health: 99, anomalies: 0 },
    { station: 'AWS-202', health: 96, anomalies: 1 },
    { station: 'AWS-301', health: 100, anomalies: 0 }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-sky-400 flex-shrink-0" />
            ANALYTICS & AI INSIGHTS ENGINE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Historical meteorological data quality trends, sensor health decay, and anomaly distributions</p>
        </div>

        <button
          onClick={() => setIsWhatIfOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-mono font-bold transition-all min-h-[44px] active:scale-[0.98] touch-manipulation"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>WHAT-IF SIMULATOR</span>
        </button>
      </div>

      <WhatIfSimulatorModal isOpen={isWhatIfOpen} onClose={() => setIsWhatIfOpen(false)} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard title="Overall Quality Score" value={`${data?.overallQualityScore || 96}%`} icon={ShieldCheck} color="emerald" />
        <StatCard title="Total Anomalies Processed" value={data?.totalAnomalies || 11} icon={AlertTriangle} color="amber" />
        <StatCard title="Sensor Fault Frequency" value={data?.sensorFaults || 7} icon={Activity} color="rose" />
        <StatCard title="Genuine Weather Events" value={data?.genuineWeatherEvents || 4} icon={CloudLightning} color="indigo" />
      </div>

      {/* Modular Pipeline & Edge AI Status Banner */}
      <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-100 uppercase tracking-wider font-orbitron block text-[10px] sm:text-[11px] truncate">
              EDGE AI ARCHITECTURE READY: ENABLED
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              Pipeline Topology: {data?.edgeAiSupport?.architecture || 'Sensor → Data Processing → AI Model → Anomaly Detection → Dashboard'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            CURRENT MODE: CLOUD AI
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
            EDGE AI CAPABLE
          </span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Most Common Anomaly Types */}
        <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 min-w-0">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
            MOST COMMON ANOMALY TYPES BREAKDOWN
          </h2>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={115} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]}>
                  {anomalyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Station Performance Metrics */}
        <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 min-w-0">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            AWS STATION HEALTH SCORE COMPARISON (%)
          </h2>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="station" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Bar dataKey="health" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
