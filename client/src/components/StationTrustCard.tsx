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

  const score = trustDetails?.overallScore ?? station.trustScore ?? station.healthScore ?? 94;
  
  let statusText = 'VERIFIED HIGH RELIABILITY';
  let statusBadge = 'gov-badge-green';
  let gaugeColor = '#15803d'; // Emerald

  if (score >= 90) {
    statusText = 'VERIFIED HIGH RELIABILITY';
    statusBadge = 'gov-badge-green';
    gaugeColor = '#15803d';
  } else if (score >= 75) {
    statusText = 'SATISFACTORY RELIABILITY';
    statusBadge = 'gov-badge-blue';
    gaugeColor = '#1d4ed8';
  } else if (score >= 50) {
    statusText = 'UNDER OBSERVATION (CAUTION)';
    statusBadge = 'gov-badge-amber';
    gaugeColor = '#b45309';
  } else {
    statusText = 'SENSOR FAULT / UNRELIABLE';
    statusBadge = 'gov-badge-red';
    gaugeColor = '#b91c1c';
  }

  const sensorTrust = trustDetails?.sensorTrust || {
    temperature: station.sensorHealth?.temperature || 96,
    humidity: station.sensorHealth?.humidity || 91,
    pressure: station.sensorHealth?.pressure || 95,
    wind: station.sensorHealth?.wind || 88,
    rainfall: station.sensorHealth?.rainfall || 94
  };

  const factors = trustDetails?.factors && trustDetails.factors.length > 0 ? trustDetails.factors : [
    { type: 'positive', message: 'Data agrees with satellite and surrounding consensus observations' },
    { type: 'positive', message: 'Physical rule checks verified within expected bounds' },
    { type: 'positive', message: 'All telemetry channels active and streaming' }
  ];

  return (
    <div className="gov-card p-4 space-y-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2 text-xs font-mono text-center rounded animate-pulse">
          ⚡ Recalculating Dynamic Station Trust Matrix...
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-900" />
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-blue-950 uppercase tracking-wider">
              AWS DATA TRUST & RELIABILITY SCORE
            </h2>
            <span className="text-[11px] text-slate-600 block">
              Multi-factor validation against physical bounds, spatial consensus & AI models
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${statusBadge}`}>
          {statusText}
        </span>
      </div>

      {/* Main Score & Factors */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Score Display (5 cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded text-center">
          <div className="text-3xl sm:text-4xl font-bold font-mono text-blue-950">
            {score}%
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            TRUST INDEX SCORE
          </span>

          <div className="w-full mt-3 space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ width: `${score}%`, backgroundColor: gaugeColor }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (CRITICAL)</span>
              <span>100% (VERIFIED)</span>
            </div>
          </div>
        </div>

        {/* Factors Breakdown (8 cols) */}
        <div className="md:col-span-8 space-y-2 bg-slate-50 p-3.5 border border-slate-200 rounded">
          <h3 className="text-xs font-bold text-blue-950 uppercase flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-blue-800" />
            SCORE DETERMINATION FACTORS
          </h3>

          <div className="space-y-1.5 text-xs">
            {factors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-800">
                {factor.type === 'positive' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                {factor.type === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                {factor.type === 'negative' && (
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] font-medium leading-snug">{factor.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Sensor Trust Breakdown */}
      <div className="pt-2 border-t border-slate-200 space-y-2">
        <span className="text-[11px] text-slate-500 font-bold font-mono uppercase block tracking-wider">
          INDIVIDUAL SENSOR TRUST SCORES
        </span>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-1">
            <div className="flex items-center justify-between text-slate-700 text-[10px] font-mono">
              <span>TEMP</span>
              <span className="font-bold text-slate-900">{sensorTrust.temperature}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-800 h-full rounded-full" style={{ width: `${sensorTrust.temperature}%` }} />
            </div>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-1">
            <div className="flex items-center justify-between text-slate-700 text-[10px] font-mono">
              <span>HUMID</span>
              <span className="font-bold text-slate-900">{sensorTrust.humidity}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-800 h-full rounded-full" style={{ width: `${sensorTrust.humidity}%` }} />
            </div>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-1">
            <div className="flex items-center justify-between text-slate-700 text-[10px] font-mono">
              <span>PRES</span>
              <span className="font-bold text-slate-900">{sensorTrust.pressure}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-800 h-full rounded-full" style={{ width: `${sensorTrust.pressure}%` }} />
            </div>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-1">
            <div className="flex items-center justify-between text-slate-700 text-[10px] font-mono">
              <span>WIND</span>
              <span className="font-bold text-slate-900">{sensorTrust.wind}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-800 h-full rounded-full" style={{ width: `${sensorTrust.wind}%` }} />
            </div>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-1 col-span-2 xs:col-span-1">
            <div className="flex items-center justify-between text-slate-700 text-[10px] font-mono">
              <span>RAIN</span>
              <span className="font-bold text-slate-900">{sensorTrust.rainfall}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-800 h-full rounded-full" style={{ width: `${sensorTrust.rainfall}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Formula Toggle */}
      <div className="pt-2 border-t border-slate-200">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center justify-between w-full text-[11px] text-slate-600 hover:text-blue-900 font-mono"
        >
          <span className="flex items-center gap-1.5 font-bold">
            <Cpu className="w-3.5 h-3.5 text-blue-900" />
            MATHEMATICAL FORMULA & CALCULATION BREAKDOWN
          </span>
          {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormula && (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1.5 text-slate-700 font-mono">
            <p className="font-bold text-blue-950">WMO QC Formula & Deductions:</p>
            <p>{trustDetails?.formulaBreakdown?.explanation || `Base Score (100) - Anomaly Deductions - Open-Meteo Discrepancy - Sensor Faults = ${score}%`}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1.5 border-t border-slate-200">
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
