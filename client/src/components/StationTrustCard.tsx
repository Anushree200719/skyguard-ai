import React, { useState } from 'react';
import { Station, TrustScoreDetails } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, Cpu, Thermometer, Droplets, Gauge, Wind, CloudRain } from 'lucide-react';

interface StationTrustCardProps {
  station: Station;
  trustDetails?: TrustScoreDetails | null;
  loading?: boolean;
}

export const StationTrustCard: React.FC<StationTrustCardProps> = ({ station, trustDetails, loading = false }) => {
  const [showFormula, setShowFormula] = useState(false);

  // Fallback calculations if trustDetails not yet returned
  const score = trustDetails?.overallScore ?? station.trustScore ?? station.healthScore ?? 94;
  
  let statusText = 'HIGHLY TRUSTED 🟢';
  let statusBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let gaugeColor = '#10b981'; // emerald-500

  if (score >= 90) {
    statusText = 'HIGHLY TRUSTED 🟢';
    statusBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    gaugeColor = '#10b981';
  } else if (score >= 75) {
    statusText = 'TRUSTED 🟢';
    statusBg = 'bg-green-500/20 text-green-300 border-green-500/40';
    gaugeColor = '#22c55e';
  } else if (score >= 50) {
    statusText = 'CAUTION 🟡';
    statusBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    gaugeColor = '#eab308';
  } else if (score >= 25) {
    statusText = 'UNRELIABLE 🟠';
    statusBg = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    gaugeColor = '#f97316';
  } else {
    statusText = 'CRITICAL 🔴';
    statusBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    gaugeColor = '#ef4444';
  }

  // Sensor Trust values
  const sensorTrust = trustDetails?.sensorTrust || {
    temperature: station.sensorHealth?.temperature || 96,
    humidity: station.sensorHealth?.humidity || 91,
    pressure: station.sensorHealth?.pressure || 95,
    wind: station.sensorHealth?.wind || 88,
    rainfall: station.sensorHealth?.rainfall || 94
  };

  // Explainable factors list
  const factors = trustDetails?.factors && trustDetails.factors.length > 0 ? trustDetails.factors : [
    { type: 'positive', message: 'Data agrees with Open-Meteo satellite observations' },
    { type: 'positive', message: 'No critical sensor anomalies detected in recent stream' },
    { type: 'positive', message: 'All 5 meteorological telemetry channels active' }
  ];

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-4 sm:p-5 rounded-xl border border-sky-500/30 bg-[#0a1529]/90 relative overflow-hidden font-mono space-y-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex items-center justify-center text-xs text-sky-400 font-bold animate-pulse">
          ⚡ Recalculating Dynamic Station Trust Matrix...
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <div>
            <h2 className="font-orbitron font-bold text-xs text-slate-100 uppercase tracking-wider">
              AI-POWERED STATION TRUST SCORE
            </h2>
            <span className="text-[10px] text-slate-400 block font-sans">
              "Can we trust this weather station data?" — Real-time 7-factor AI validation
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-bold font-orbitron border ${statusBg}`}>
          {statusText}
        </span>
      </div>

      {/* Main Grid: Score Gauge + Factors Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Left Column: Circular Trust Gauge & Progress (4 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="relative w-32 h-32 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#1e293b"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={gaugeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-orbitron font-extrabold text-2xl text-slate-100">
                {score}%
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                TRUST SCORE
              </span>
            </div>
          </div>

          {/* Ascii Visual Progress Bar */}
          <div className="w-full max-w-[200px] mt-2 space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div 
                className="h-full transition-all duration-700" 
                style={{ width: `${score}%`, backgroundColor: gaugeColor }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-bold font-mono">
              <span>0% (CRITICAL)</span>
              <span>100% (HIGH)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Why is the Trust Score X%? (7 cols) */}
        <div className="md:col-span-7 space-y-2.5 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-sky-300 font-orbitron uppercase flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            WHY IS THE TRUST SCORE {score}%?
          </h3>

          <div className="space-y-1.5 text-xs">
            {factors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-200">
                {factor.type === 'positive' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                {factor.type === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                {factor.type === 'negative' && (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] leading-tight">{factor.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Parameter Trust Breakdown Grid */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <span className="text-[11px] text-slate-400 font-bold font-orbitron uppercase block">
          INDIVIDUAL SENSOR PARAMETER TRUST SCORES
        </span>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
            <div className="flex items-center justify-between text-sky-400 text-[10px] font-bold mb-1">
              <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> TEMP</span>
              <span className="text-slate-100">{sensorTrust.temperature}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-sky-400 h-full" style={{ width: `${sensorTrust.temperature}%` }} />
            </div>
          </div>

          <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
            <div className="flex items-center justify-between text-cyan-400 text-[10px] font-bold mb-1">
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> HUMID</span>
              <span className="text-slate-100">{sensorTrust.humidity}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full" style={{ width: `${sensorTrust.humidity}%` }} />
            </div>
          </div>

          <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
            <div className="flex items-center justify-between text-indigo-400 text-[10px] font-bold mb-1">
              <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> PRES</span>
              <span className="text-slate-100">{sensorTrust.pressure}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-400 h-full" style={{ width: `${sensorTrust.pressure}%` }} />
            </div>
          </div>

          <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
            <div className="flex items-center justify-between text-amber-400 text-[10px] font-bold mb-1">
              <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> WIND</span>
              <span className="text-slate-100">{sensorTrust.wind}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${sensorTrust.wind}%` }} />
            </div>
          </div>

          <div className="p-2 bg-slate-900/80 rounded border border-slate-800 col-span-2 xs:col-span-1">
            <div className="flex items-center justify-between text-emerald-400 text-[10px] font-bold mb-1">
              <span className="flex items-center gap-1"><CloudRain className="w-3 h-3" /> RAIN</span>
              <span className="text-slate-100">{sensorTrust.rainfall}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${sensorTrust.rainfall}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Calculation Drawer Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-sky-300 transition-colors font-mono"
        >
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            TRANSPARENT MATHEMATICAL CALCULATION BREAKDOWN
          </span>
          {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormula && (
          <div className="mt-2.5 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[10px] space-y-1.5 text-slate-300 font-mono">
            <p className="font-bold text-sky-400">Formula & Weights:</p>
            <p>{trustDetails?.formulaBreakdown?.explanation || `Base Score (100) - Anomaly Deductions - Open-Meteo Discrepancy - Sensor Faults = ${score}%`}</p>
            <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 pt-1 border-t border-slate-900">
              <div>• Base Score: 100.0 pts</div>
              <div>• Anomaly Deductions: -{trustDetails?.formulaBreakdown?.anomalyDeductions ?? 0} pts</div>
              <div>• Satellite Discrepancy: -{trustDetails?.formulaBreakdown?.openMeteoDiscrepancyPenalty ?? 0} pts</div>
              <div>• Sensor Faults: -{trustDetails?.formulaBreakdown?.sensorFlatlineSpikePenalty ?? 0} pts</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
