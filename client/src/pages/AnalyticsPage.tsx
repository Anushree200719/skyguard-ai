import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../services/api';
import { StatCard } from '../components/StatCard';
import { BrainCircuit, ShieldCheck, AlertTriangle, CloudLightning, Activity, BarChart2, Sliders, Cpu } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { WhatIfSimulatorModal } from '../components/WhatIfSimulatorModal';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchAnalytics().then(res => setData(res.summary)).catch(console.warn);
  }, []);

  const anomalyTypeData = [
    { name: 'Genuine Weather Events', count: data?.genuineWeatherEvents || 4, color: '#1d4ed8' },
    { name: 'Sensor Spikes', count: 3, color: '#b45309' },
    { name: 'Sensor Drift', count: 2, color: '#b91c1c' },
    { name: 'Frozen Sensor', count: 1, color: '#4f46e5' },
    { name: 'Missing Data', count: data?.communicationFailures || 1, color: '#475569' }
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
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>SYSTEM ANALYTICS</span>
            <span>•</span>
            <span>DATA QUALITY ENGINE</span>
          </div>
          <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <BrainCircuit className="w-5 h-5 text-blue-900 flex-shrink-0" />
            NATIONAL AWS DATA QUALITY ANALYTICS & AI METRICS
          </h1>
          <p className="text-xs text-slate-600">Meteorological data quality statistics, sensor degradation profiles & anomaly distributions</p>
        </div>

        <button
          onClick={() => setIsWhatIfOpen(true)}
          className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold uppercase transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>WHAT-IF SIMULATOR</span>
        </button>
      </div>

      <WhatIfSimulatorModal isOpen={isWhatIfOpen} onClose={() => setIsWhatIfOpen(false)} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Overall Quality Score" value={`${data?.overallQualityScore || 96}%`} icon={ShieldCheck} color="emerald" />
        <StatCard title="Total Anomalies Processed" value={data?.totalAnomalies || 11} icon={AlertTriangle} color="amber" />
        <StatCard title="Sensor Fault Frequency" value={data?.sensorFaults || 7} icon={Activity} color="rose" />
        <StatCard title="Genuine Weather Events" value={data?.genuineWeatherEvents || 4} icon={CloudLightning} color="indigo" />
      </div>

      {/* Edge AI Banner */}
      <div className="gov-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-blue-900" />
          <div>
            <span className="font-bold text-blue-950 uppercase block text-xs">
              SYSTEM ARCHITECTURE: HYBRID CLOUD / EDGE AI ACTIVE
            </span>
            <span className="text-[11px] text-slate-600 block">
              Topology: {data?.edgeAiSupport?.architecture || 'Sensor Node → Rule Check → IsoForest & PyTorch LSTM → Spatial Consensus → Dashboard'}
            </span>
          </div>
        </div>

        <span className="gov-badge-green text-xs font-bold px-2.5 py-1 rounded border">
          STATUS: OPERATIONAL
        </span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="gov-card p-4">
          <h2 className="font-bold text-xs text-blue-950 uppercase mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-900" />
            ANOMALY CLASSIFICATION BREAKDOWN
          </h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', color: '#0f172a' }} />
                <Bar dataKey="count" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gov-card p-4">
          <h2 className="font-bold text-xs text-blue-950 uppercase mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-900" />
            AWS STATION HEALTH INDEX COMPARISON (%)
          </h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="station" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', color: '#0f172a' }} />
                <Bar dataKey="health" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
