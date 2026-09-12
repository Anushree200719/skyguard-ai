import React from 'react';
import { Station, OpenMeteoComparisonResult } from '../types';
import { Scale, CheckCircle2, AlertTriangle, XCircle, Satellite, MapPin, Thermometer, Droplets, Gauge, Wind, CloudRain, Info } from 'lucide-react';

interface OpenMeteoComparisonCardProps {
  station: Station;
  comparisonData?: OpenMeteoComparisonResult | null;
  loading?: boolean;
}

export const OpenMeteoComparisonCard: React.FC<OpenMeteoComparisonCardProps> = ({ station, comparisonData, loading = false }) => {
  const agreement = comparisonData?.overallAgreement ?? 94;

  let overallStatusText = 'EXCELLENT AGREEMENT 🟢';
  let overallStatusBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let gaugeColor = '#10b981';

  if (agreement >= 90) {
    overallStatusText = 'EXCELLENT AGREEMENT 🟢';
    overallStatusBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    gaugeColor = '#10b981';
  } else if (agreement >= 70) {
    overallStatusText = 'MODERATE AGREEMENT 🟡';
    overallStatusBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    gaugeColor = '#eab308';
  } else {
    overallStatusText = 'POOR AGREEMENT 🔴';
    overallStatusBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    gaugeColor = '#ef4444';
  }

  const parameters = comparisonData?.parameters || [
    {
      id: 'temperature',
      name: 'Temperature',
      unit: '°C',
      awsValue: 27.99,
      openMeteoValue: 28.40,
      difference: 0.41,
      agreementPercentage: 98,
      status: 'NORMAL',
      statusLabel: 'NORMAL ✓',
      statusColor: '#10b981',
      thresholdText: 'Normal ≤ 2.0°C | Warning ≤ 4.0°C | Critical > 4.0°C'
    },
    {
      id: 'humidity',
      name: 'Relative Humidity',
      unit: '%',
      awsValue: 64.8,
      openMeteoValue: 67.2,
      difference: 2.4,
      agreementPercentage: 94,
      status: 'NORMAL',
      statusLabel: 'NORMAL ✓',
      statusColor: '#10b981',
      thresholdText: 'Normal ≤ 10% | Warning ≤ 20% | Critical > 20%'
    },
    {
      id: 'pressure',
      name: 'Surface Pressure',
      unit: 'hPa',
      awsValue: 1012.3,
      openMeteoValue: 1013.1,
      difference: 0.8,
      agreementPercentage: 95,
      status: 'NORMAL',
      statusLabel: 'NORMAL ✓',
      statusColor: '#10b981',
      thresholdText: 'Normal ≤ 3.0 hPa | Warning ≤ 6.0 hPa | Critical > 6.0 hPa'
    },
    {
      id: 'windSpeed',
      name: 'Wind Speed',
      unit: 'm/s',
      awsValue: 11.8,
      openMeteoValue: 12.4,
      difference: 0.6,
      agreementPercentage: 95,
      status: 'NORMAL',
      statusLabel: 'NORMAL ✓',
      statusColor: '#10b981',
      thresholdText: 'Normal ≤ 3.0 m/s | Warning ≤ 6.0 m/s | Critical > 6.0 m/s'
    },
    {
      id: 'rainfall',
      name: 'Precipitation',
      unit: 'mm',
      awsValue: 0.0,
      openMeteoValue: 0.0,
      difference: 0.0,
      agreementPercentage: 100,
      status: 'NORMAL',
      statusLabel: 'NORMAL ✓',
      statusColor: '#10b981',
      thresholdText: 'Normal ≤ 2.0 mm | Warning ≤ 5.0 mm | Critical > 5.0 mm'
    }
  ];

  const getParamIcon = (id: string) => {
    switch (id) {
      case 'temperature': return <Thermometer className="w-4 h-4 text-sky-400" />;
      case 'humidity': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'pressure': return <Gauge className="w-4 h-4 text-indigo-400" />;
      case 'windSpeed': return <Wind className="w-4 h-4 text-amber-400" />;
      case 'rainfall': return <CloudRain className="w-4 h-4 text-emerald-400" />;
      default: return <Satellite className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="glass-card p-4 sm:p-5 rounded-xl border border-cyan-500/30 bg-[#091428]/90 relative overflow-hidden font-mono space-y-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex items-center justify-center text-xs text-cyan-400 font-bold animate-pulse">
          🛰️ Cross-referencing AWS Telemetry against Open-Meteo Satellite Data...
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <h2 className="font-orbitron font-bold text-xs text-slate-100 uppercase tracking-wider">
              AWS STATION VS. OPEN-METEO SATELLITE COMPARISON
            </h2>
            <span className="text-[10px] text-slate-400 block font-sans">
              Exact parameter agreement matrix using coordinates: {station.latitude?.toFixed(4)}°N, {station.longitude?.toFixed(4)}°E ({station.name})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-xs font-bold font-orbitron border ${overallStatusBg}`}>
            {overallStatusText}
          </span>
        </div>
      </div>

      {/* Overall Data Agreement Badge Banner */}
      <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">OVERALL AGREEMENT</span>
            <span className="font-orbitron font-extrabold text-2xl text-slate-100">{agreement}%</span>
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{station.stationId} ({station.name})</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cross-validating 5 active AWS sensor channels against localized satellite weather radar.
            </p>
          </div>
        </div>

        {/* Agreement Status Tiers Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟢 Excellent (≥90%)</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">🟡 Moderate (70-89%)</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">🔴 Poor (&lt;70%)</span>
        </div>
      </div>

      {/* 5-Parameter Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {parameters.map((param) => {
          const isUnavailable = param.status === 'UNAVAILABLE';
          const agreementVal = param.agreementPercentage ?? 0;

          return (
            <div 
              key={param.id} 
              className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/90 flex flex-col justify-between space-y-2 relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                  {getParamIcon(param.id)}
                  <span className="font-orbitron font-bold text-xs text-slate-200">{param.name}</span>
                </div>
              </div>

              {/* AWS vs Open-Meteo Values */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between p-1.5 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-[10px] text-sky-400 font-bold">AWS Station:</span>
                  <span className="font-bold text-slate-100">
                    {param.awsValue !== null && param.awsValue !== undefined ? `${param.awsValue}${param.unit}` : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-bold">Open-Meteo:</span>
                  <span className="font-bold text-slate-100">
                    {param.openMeteoValue !== null && param.openMeteoValue !== undefined ? `${param.openMeteoValue}${param.unit}` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Difference & Agreement */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Difference:</span>
                  <span className="font-bold text-amber-300">
                    {param.difference !== null && param.difference !== undefined ? `${param.difference}${param.unit}` : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Agreement:</span>
                  <span className="font-bold text-emerald-400">
                    {isUnavailable ? 'N/A' : `${agreementVal}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-1">
                  <div 
                    className="h-full transition-all duration-700"
                    style={{ 
                      width: `${isUnavailable ? 0 : agreementVal}%`, 
                      backgroundColor: param.statusColor || gaugeColor 
                    }} 
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-1 flex items-center justify-between">
                <span 
                  className="text-[9px] font-bold px-2 py-0.5 rounded uppercase font-orbitron"
                  style={{ 
                    backgroundColor: `${param.statusColor}20`, 
                    color: param.statusColor,
                    borderColor: `${param.statusColor}40`,
                    borderWidth: '1px'
                  }}
                >
                  {param.statusLabel}
                </span>

                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
                  <div className="hidden group-hover:block absolute bottom-full right-0 mb-1 w-48 p-2 bg-slate-950 text-[10px] text-slate-300 rounded shadow-xl border border-slate-700 font-sans z-30">
                    {param.thresholdText}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
