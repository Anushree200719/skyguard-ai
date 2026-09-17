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
    <div className="liquid-glass p-4 sm:p-5 rounded-3xl border-none relative overflow-hidden font-poppins space-y-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center text-xs text-white font-medium animate-pulse font-mono">
          🛰️ Cross-referencing AWS Telemetry against Open-Meteo Satellite Data...
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl liquid-glass text-white">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-poppins font-medium text-xs sm:text-sm text-white uppercase tracking-wider">
              AWS STATION VS. OPEN-METEO SATELLITE COMPARISON
            </h2>
            <span className="text-[10px] text-white/50 block font-light">
              Exact parameter agreement matrix using coordinates: {station.latitude?.toFixed(4)}°N, {station.longitude?.toFixed(4)}°E ({station.name})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-medium ${overallStatusBg}`}>
            {overallStatusText}
          </span>
        </div>
      </div>

      {/* Overall Data Agreement Badge Banner */}
      <div className="p-4 liquid-glass rounded-2xl flex flex-wrap items-center justify-between gap-3 border-none">
        <div className="flex items-center gap-3.5">
          <div className="p-3 liquid-glass rounded-xl text-center">
            <span className="text-[10px] text-white/50 block font-mono font-medium">OVERALL AGREEMENT</span>
            <span className="font-poppins font-medium text-2xl text-white">{agreement}%</span>
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <MapPin className="w-3.5 h-3.5 text-white/80" />
              <span>{station.stationId} ({station.name})</span>
            </div>
            <p className="text-[11px] text-white/60 font-light">
              Cross-validating 5 active AWS sensor channels against localized satellite weather radar.
            </p>
          </div>
        </div>

        {/* Agreement Status Tiers Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2.5 py-1 rounded-full liquid-glass text-emerald-300 border border-emerald-500/30">🟢 Excellent (≥90%)</span>
          <span className="px-2.5 py-1 rounded-full liquid-glass text-amber-300 border border-amber-500/30">🟡 Moderate (70-89%)</span>
          <span className="px-2.5 py-1 rounded-full liquid-glass text-rose-300 border border-rose-500/30">🔴 Poor (&lt;70%)</span>
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
              className="p-3.5 liquid-glass rounded-2xl flex flex-col justify-between space-y-2.5 relative border-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  {getParamIcon(param.id)}
                  <span className="font-poppins font-medium text-xs text-white">{param.name}</span>
                </div>
              </div>

              {/* AWS vs Open-Meteo Values */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 liquid-glass rounded-xl">
                  <span className="text-[10px] text-white/50 font-medium">AWS Station:</span>
                  <span className="font-semibold text-white">
                    {param.awsValue !== null && param.awsValue !== undefined ? `${param.awsValue}${param.unit}` : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 liquid-glass rounded-xl">
                  <span className="text-[10px] text-white/50 font-medium">Open-Meteo:</span>
                  <span className="font-semibold text-white">
                    {param.openMeteoValue !== null && param.openMeteoValue !== undefined ? `${param.openMeteoValue}${param.unit}` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Difference & Agreement */}
              <div className="space-y-1 pt-1.5 border-t border-white/10 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/50">Difference:</span>
                  <span className="font-semibold text-white">
                    {param.difference !== null && param.difference !== undefined ? `${param.difference}${param.unit}` : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/50">Agreement:</span>
                  <span className="font-semibold text-emerald-300">
                    {isUnavailable ? 'N/A' : `${agreementVal}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden my-1">
                  <div 
                    className="h-full transition-all duration-700 rounded-full"
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
                  className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full uppercase"
                  style={{ 
                    backgroundColor: `${param.statusColor}25`, 
                    color: '#ffffff',
                    borderColor: `${param.statusColor}40`,
                    borderWidth: '1px'
                  }}
                >
                  {param.statusLabel}
                </span>

                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-white/40 hover:text-white cursor-help" />
                  <div className="hidden group-hover:block absolute bottom-full right-0 mb-1.5 w-48 p-2.5 liquid-glass-strong text-[10px] text-white/80 rounded-2xl shadow-2xl font-sans z-30 border border-white/20">
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
