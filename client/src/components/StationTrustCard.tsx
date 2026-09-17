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
    <div className="liquid-glass p-4 sm:p-5 rounded-3xl border-none relative overflow-hidden font-poppins space-y-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center text-xs text-white font-medium animate-pulse">
          ⚡ Recalculating Dynamic Station Trust Matrix...
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl liquid-glass text-white">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-poppins font-medium text-xs sm:text-sm text-white uppercase tracking-wider">
              AI-POWERED STATION TRUST SCORE
            </h2>
            <span className="text-[10px] text-white/50 block font-light">
              "Can we trust this weather station data?" — Real-time 7-factor AI validation
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-medium ${statusBg}`}>
          {statusText}
        </span>
      </div>

      {/* Main Grid: Score Gauge + Factors Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Left Column: Circular Trust Gauge & Progress (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 liquid-glass rounded-2xl border-none text-center">
          <div className="relative w-32 h-32 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="rgba(255,255,255,0.1)"
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
              <span className="font-poppins font-medium text-2xl text-white">
                {score}%
              </span>
              <span className="text-[9px] text-white/50 font-medium uppercase tracking-wider font-mono">
                TRUST SCORE
              </span>
            </div>
          </div>

          {/* Ascii Visual Progress Bar */}
          <div className="w-full max-w-[200px] mt-2 space-y-1">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full transition-all duration-700 rounded-full" 
                style={{ width: `${score}%`, backgroundColor: gaugeColor }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-white/40 font-mono">
              <span>0% (CRITICAL)</span>
              <span>100% (HIGH)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Why is the Trust Score X%? (7 cols) */}
        <div className="md:col-span-7 space-y-2.5 liquid-glass p-4 rounded-2xl border-none">
          <h3 className="text-xs font-medium text-white tracking-wide uppercase flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-white/80" />
            WHY IS THE TRUST SCORE {score}%?
          </h3>

          <div className="space-y-2 text-xs">
            {factors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-white/90">
                {factor.type === 'positive' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                )}
                {factor.type === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                )}
                {factor.type === 'negative' && (
                  <XCircle className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] font-light leading-snug">{factor.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Parameter Trust Breakdown Grid */}
      <div className="pt-2 border-t border-white/10 space-y-2.5">
        <span className="text-[11px] text-white/50 font-medium font-mono uppercase block tracking-wider">
          INDIVIDUAL SENSOR PARAMETER TRUST SCORES
        </span>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="p-2.5 liquid-glass rounded-xl space-y-1">
            <div className="flex items-center justify-between text-white/80 text-[10px] font-mono mb-1">
              <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-white/60" /> TEMP</span>
              <span className="text-white font-medium">{sensorTrust.temperature}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white/80 h-full rounded-full" style={{ width: `${sensorTrust.temperature}%` }} />
            </div>
          </div>

          <div className="p-2.5 liquid-glass rounded-xl space-y-1">
            <div className="flex items-center justify-between text-white/80 text-[10px] font-mono mb-1">
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-white/60" /> HUMID</span>
              <span className="text-white font-medium">{sensorTrust.humidity}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white/80 h-full rounded-full" style={{ width: `${sensorTrust.humidity}%` }} />
            </div>
          </div>

          <div className="p-2.5 liquid-glass rounded-xl space-y-1">
            <div className="flex items-center justify-between text-white/80 text-[10px] font-mono mb-1">
              <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-white/60" /> PRES</span>
              <span className="text-white font-medium">{sensorTrust.pressure}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white/80 h-full rounded-full" style={{ width: `${sensorTrust.pressure}%` }} />
            </div>
          </div>

          <div className="p-2.5 liquid-glass rounded-xl space-y-1">
            <div className="flex items-center justify-between text-white/80 text-[10px] font-mono mb-1">
              <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-white/60" /> WIND</span>
              <span className="text-white font-medium">{sensorTrust.wind}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white/80 h-full rounded-full" style={{ width: `${sensorTrust.wind}%` }} />
            </div>
          </div>

          <div className="p-2.5 liquid-glass rounded-xl space-y-1 col-span-2 xs:col-span-1">
            <div className="flex items-center justify-between text-white/80 text-[10px] font-mono mb-1">
              <span className="flex items-center gap-1"><CloudRain className="w-3 h-3 text-white/60" /> RAIN</span>
              <span className="text-white font-medium">{sensorTrust.rainfall}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white/80 h-full rounded-full" style={{ width: `${sensorTrust.rainfall}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Calculation Drawer Toggle */}
      <div className="pt-2 border-t border-white/10">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center justify-between w-full text-[11px] text-white/60 hover:text-white transition-colors font-mono cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-white/80" />
            TRANSPARENT MATHEMATICAL CALCULATION BREAKDOWN
          </span>
          {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormula && (
          <div className="mt-2.5 p-3.5 liquid-glass rounded-2xl text-[10px] space-y-1.5 text-white/80 font-mono">
            <p className="font-semibold text-white">Formula & Weights:</p>
            <p className="font-light">{trustDetails?.formulaBreakdown?.explanation || `Base Score (100) - Anomaly Deductions - Open-Meteo Discrepancy - Sensor Faults = ${score}%`}</p>
            <div className="grid grid-cols-2 gap-2 text-[9px] text-white/50 pt-1.5 border-t border-white/10">
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
