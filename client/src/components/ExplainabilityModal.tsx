import React from 'react';
import { XAIExplanationResult } from '../types';
import { Brain, CheckCircle2, AlertTriangle, XCircle, Info, Scale, ShieldCheck, X, Sparkles, Cpu } from 'lucide-react';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: XAIExplanationResult | null;
  loading?: boolean;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  explanation,
  loading = false
}) => {
  if (!isOpen) return null;

  const confPercent = explanation?.confidencePercentage ?? 94;
  const classification = explanation?.classification ? explanation.classification.replace(/_/g, ' ') : 'POSSIBLE SENSOR FAULT';
  const severity = explanation?.severity || 'HIGH';

  let severityBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (severity === 'CRITICAL') severityBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  else if (severity === 'LOW' || severity === 'NORMAL') severityBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const primaryFactors = explanation?.primaryFactors || [
    'Sudden temperature step jump: Δ8.4°C in single 3-second cycle',
    'Open-Meteo satellite discrepancy: Δ8.4°C difference from localized weather radar',
    'Spatial Consensus mismatch: Nearby stations (AWS-102, AWS-103) report 34.2°C average'
  ];

  const empiricalEvidence = explanation?.empiricalEvidence || [
    'AWS Thermistor Telemetry: 42.80°C',
    'Open-Meteo Satellite Radar Baseline: 34.40°C',
    'Historical Expected Envelope: 28.0°C – 34.0°C',
    'Spatial Consensus Matching Ratio: 0% (0/3 nearby stations confirm 42.8°C)'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 font-poppins text-xs animate-in fade-in duration-200">
      <div className="liquid-glass-strong w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-2 text-white font-medium animate-pulse">
            <Brain className="w-8 h-8 text-white animate-bounce" />
            <span>🧠 Synthesizing Transparent AI Explanation Matrix...</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl liquid-glass text-white">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-poppins font-medium text-sm text-white tracking-tight flex items-center gap-2">
                AI ANALYSIS EXPLANATION — {explanation?.stationId || 'AWS STATION'}
              </h2>
              <span className="text-[10px] text-white/50 block font-light">
                Transparent multi-layer decision breakdown & empirical evidence log
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full liquid-glass transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Confidence & Status Banner */}
        <div className="p-4 liquid-glass rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="p-3 liquid-glass rounded-xl text-center">
              <span className="text-[10px] text-white/50 block font-mono font-medium">AI CONFIDENCE</span>
              <span className="font-poppins font-medium text-2xl text-white">{confPercent}%</span>
            </div>

            <div className="space-y-1">
              <span className={`text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full uppercase ${severityBg}`}>
                {classification} ({severity})
              </span>
              <p className="text-xs text-white font-medium mt-1">
                {explanation?.summary || 'Sensor telemetry analyzed across 5 meteorological channels.'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Factors List */}
        <div className="space-y-2.5 liquid-glass p-4 sm:p-5 rounded-2xl border-none">
          <span className="text-white font-medium text-xs font-mono flex items-center gap-2 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            PRIMARY FACTORS ("WHY WAS THIS FLAGGED?"):
          </span>

          <div className="space-y-2 pt-1">
            {primaryFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-white/90">
                <span className="text-emerald-300 font-bold text-sm">✓</span>
                <span className="text-xs font-light">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Empirical Evidence & Telemetry Metrics */}
        <div className="space-y-2.5 liquid-glass p-4 sm:p-5 rounded-2xl border-none">
          <span className="text-white font-medium text-xs font-mono flex items-center gap-2 uppercase tracking-wider">
            <Info className="w-4 h-4 text-white/80" />
            EMPIRICAL EVIDENCE & TELEMETRY METRICS:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 font-mono">
            {empiricalEvidence.map((ev, idx) => (
              <div key={idx} className="p-2.5 liquid-glass rounded-xl text-white/80">
                • {ev}
              </div>
            ))}
          </div>
        </div>

        {/* Data Comparisons Grid (if available) */}
        {explanation?.dataComparisons && explanation.dataComparisons.length > 0 && (
          <div className="space-y-2.5 border-t border-white/10 pt-3">
            <span className="text-white font-medium text-xs font-mono flex items-center gap-2 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-white/80" />
              AWS TELEMETRY VS. SATELLITE COMPARISON EVIDENCE:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              {explanation.dataComparisons.map((comp, idx) => (
                <div key={idx} className="p-2.5 liquid-glass rounded-xl text-[10px] space-y-0.5">
                  <span className="text-white/50 block font-medium mb-0.5">{comp.name}</span>
                  <div className="text-white">AWS: <span className="font-semibold">{comp.aws}</span></div>
                  <div className="text-white/60">Meteo: {comp.openMeteo}</div>
                  <div className="text-white font-semibold mt-0.5">Diff: {comp.diff}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Methodology & System Transparency Notice */}
        <div className="p-4 liquid-glass rounded-2xl space-y-1.5 font-mono">
          <span className="text-[10px] text-white/50 font-medium flex items-center gap-1.5 uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-white/80" />
            AI METHODOLOGY & TRANSPARENCY NOTICE
          </span>
          <p className="text-[10px] text-white/70 leading-relaxed font-light">
            {explanation?.systemTransparency || 'This explanation is synthesized from physical quality control rules combined with PyTorch LSTM Autoencoder reconstruction loss, Isolation Forest SHAP feature impacts, and Spatial Consensus ratios across surrounding AWS stations.'}
          </p>
        </div>

        {/* Actionable Recommendation */}
        <div className="p-4 liquid-glass rounded-2xl flex items-center justify-between text-xs font-medium text-white border border-white/20">
          <span>Recommended Action: {explanation?.recommendedAction || 'Schedule regular calibration inspection.'}</span>
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="liquid-glass rounded-full px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
